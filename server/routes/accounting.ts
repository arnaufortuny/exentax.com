import type { Express, Response } from "express";
import { z } from "zod";
import { db, isAdmin, logAudit, asyncHandler, parseIdParam } from "./shared";
import { createLogger } from "../lib/logger";

const log = createLogger('accounting');
import { accountingTransactions } from "@shared/schema";
import { and, eq, desc, sql } from "drizzle-orm";

const createTransactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  category: z.string().min(1).max(100),
  amount: z.union([z.string(), z.number()]).refine(val => !isNaN(Number(val)) && Number(val) > 0, { message: "Amount must be a positive number" }),
  currency: z.string().length(3).optional().default('EUR'),
  description: z.string().max(1000).optional().nullable(),
  orderId: z.number().int().positive().optional().nullable(),
  userId: z.string().optional().nullable(),
  reference: z.string().max(200).optional().nullable(),
  transactionDate: z.string().optional().nullable().refine(val => !val || !isNaN(Date.parse(val)), { message: "Invalid date format" }),
  notes: z.string().max(2000).optional().nullable(),
});

const updateTransactionSchema = createTransactionSchema.partial();

export function registerAccountingRoutes(app: Express) {
  // Get all transactions with filters
  app.get("/api/admin/accounting/transactions", isAdmin, asyncHandler(async (req: any, res: Response) => {
    try {
      const { type, category, startDate, endDate } = req.query;
      
      const conditions: any[] = [];
      
      if (type && typeof type === 'string') {
        conditions.push(eq(accountingTransactions.type, type));
      }
      if (category && typeof category === 'string') {
        conditions.push(eq(accountingTransactions.category, category));
      }
      if (startDate && typeof startDate === 'string') {
        const d = new Date(startDate);
        if (!isNaN(d.getTime())) conditions.push(sql`${accountingTransactions.transactionDate} >= ${d}`);
      }
      if (endDate && typeof endDate === 'string') {
        const d = new Date(endDate);
        if (!isNaN(d.getTime())) conditions.push(sql`${accountingTransactions.transactionDate} <= ${d}`);
      }
      
      const transactions = await db.select()
        .from(accountingTransactions)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(accountingTransactions.transactionDate));
      
      res.json(transactions);
    } catch (err) {
      log.error("Error fetching accounting transactions", err);
      res.status(500).json({ message: "Error fetching transactions" });
    }
  }));
  
  // Get accounting summary/stats
  app.get("/api/admin/accounting/summary", isAdmin, asyncHandler(async (req: any, res: Response) => {
    try {
      const { period } = req.query; // 'month', 'year', 'all'
      
      let startDate: Date | null = null;
      const now = new Date();
      
      if (period === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (period === 'year') {
        startDate = new Date(now.getFullYear(), 0, 1);
      }
      
      const dateCondition = startDate 
        ? sql`${accountingTransactions.transactionDate} >= ${startDate}`
        : sql`1=1`;
      
      const [incomeResult] = await db.select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
        .from(accountingTransactions)
        .where(and(eq(accountingTransactions.type, 'income'), dateCondition));
      
      const [expenseResult] = await db.select({ total: sql<number>`COALESCE(SUM(ABS(amount)), 0)` })
        .from(accountingTransactions)
        .where(and(eq(accountingTransactions.type, 'expense'), dateCondition));
      
      const totalIncome = Number(incomeResult?.total || 0);
      const totalExpenses = Number(expenseResult?.total || 0);
      
      // Get breakdown by category
      const categoryBreakdown = await db.select({
        category: accountingTransactions.category,
        type: accountingTransactions.type,
        total: sql<number>`SUM(ABS(amount))`
      })
        .from(accountingTransactions)
        .where(dateCondition)
        .groupBy(accountingTransactions.category, accountingTransactions.type);
      
      res.json({
        totalIncome,
        totalExpenses,
        netBalance: totalIncome - totalExpenses,
        categoryBreakdown
      });
    } catch (err) {
      log.error("Error fetching accounting summary", err);
      res.status(500).json({ message: "Error fetching accounting summary" });
    }
  }));
  
  // Create transaction
  app.post("/api/admin/accounting/transactions", isAdmin, asyncHandler(async (req: any, res: Response) => {
    try {
      const parsed = createTransactionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten().fieldErrors });
      }
      const { type, category, amount, currency, description, orderId, userId, reference, transactionDate, notes } = parsed.data;
      
      const amountCents = Math.round(Number(amount) * 100);
      
      const [transaction] = await db.insert(accountingTransactions).values({
        type,
        category,
        amount: type === 'expense' ? -Math.abs(amountCents) : Math.abs(amountCents),
        currency: currency || 'EUR',
        description,
        orderId: orderId || null,
        userId: userId || null,
        reference,
        transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
        createdBy: req.session?.userId,
        notes
      }).returning();
      
      logAudit({
        action: 'accounting_transaction_created',
        userId: req.session?.userId,
        targetId: String(transaction.id),
        details: { type, category, amount: amountCents }
      });
      
      res.json(transaction);
    } catch (err) {
      log.error("Error creating transaction", err);
      res.status(500).json({ message: "Error creating transaction" });
    }
  }));
  
  // Update transaction
  app.patch("/api/admin/accounting/transactions/:id", isAdmin, asyncHandler(async (req: any, res: Response) => {
    try {
      const txId = parseIdParam(req);
      const parsed = updateTransactionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten().fieldErrors });
      }
      const { type, category, amount, currency, description, reference, transactionDate, notes } = parsed.data;
      
      const [existing] = await db.select().from(accountingTransactions).where(eq(accountingTransactions.id, txId)).limit(1);
      if (!existing) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      const updateData: Record<string, any> = { updatedAt: new Date() };
      if (type) updateData.type = type;
      if (category) updateData.category = category;
      if (amount !== undefined) {
        const amountCents = Math.round(Number(amount) * 100);
        const effectiveType = type || existing.type;
        updateData.amount = effectiveType === 'expense' ? -Math.abs(amountCents) : Math.abs(amountCents);
      }
      if (currency) updateData.currency = currency;
      if (description !== undefined) updateData.description = description;
      if (reference !== undefined) updateData.reference = reference;
      if (transactionDate) updateData.transactionDate = new Date(transactionDate);
      if (notes !== undefined) updateData.notes = notes;
      
      const [updated] = await db.update(accountingTransactions)
        .set(updateData)
        .where(eq(accountingTransactions.id, txId))
        .returning();
      
      logAudit({
        action: 'accounting_transaction_updated',
        userId: req.session?.userId,
        targetId: String(txId),
        details: updateData
      });
      
      res.json(updated);
    } catch (err) {
      log.error("Error updating transaction", err);
      res.status(500).json({ message: "Error updating transaction" });
    }
  }));
  
  // Delete transaction
  app.delete("/api/admin/accounting/transactions/:id", isAdmin, asyncHandler(async (req: any, res: Response) => {
    try {
      const txId = parseIdParam(req);
      
      const [existing] = await db.select({ id: accountingTransactions.id }).from(accountingTransactions).where(eq(accountingTransactions.id, txId)).limit(1);
      if (!existing) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      await db.delete(accountingTransactions).where(eq(accountingTransactions.id, txId));
      
      logAudit({
        action: 'accounting_transaction_deleted',
        userId: req.session?.userId,
        targetId: String(txId)
      });
      
      res.json({ success: true });
    } catch (err) {
      log.error("Error deleting transaction", err);
      res.status(500).json({ message: "Error deleting transaction" });
    }
  }));
  
  // Export transactions to CSV
  app.get("/api/admin/accounting/export-csv", isAdmin, asyncHandler(async (req: any, res: Response) => {
    try {
      const { startDate, endDate, type, category, period } = req.query;
      
      const conditions: any[] = [];
      if (type && typeof type === 'string') {
        conditions.push(eq(accountingTransactions.type, type));
      }
      if (category && typeof category === 'string') {
        conditions.push(eq(accountingTransactions.category, category));
      }
      
      if (period && typeof period === 'string') {
        const now = new Date();
        if (period === 'month') {
          conditions.push(sql`${accountingTransactions.transactionDate} >= ${new Date(now.getFullYear(), now.getMonth(), 1)}`);
        } else if (period === 'year') {
          conditions.push(sql`${accountingTransactions.transactionDate} >= ${new Date(now.getFullYear(), 0, 1)}`);
        }
      } else {
        if (startDate && typeof startDate === 'string') {
          const d = new Date(startDate);
          if (!isNaN(d.getTime())) conditions.push(sql`${accountingTransactions.transactionDate} >= ${d}`);
        }
        if (endDate && typeof endDate === 'string') {
          const d = new Date(endDate);
          if (!isNaN(d.getTime())) conditions.push(sql`${accountingTransactions.transactionDate} <= ${d}`);
        }
      }
      
      const transactions = await db.select()
        .from(accountingTransactions)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(accountingTransactions.transactionDate));
      
      const escCsv = (val: string) => val.includes(';') || val.includes('"') || val.includes('\n') ? `"${val.replace(/"/g, '""')}"` : val;
      
      const headers = ['ID', 'Fecha', 'Tipo', 'Categoría', 'Importe (€)', 'Moneda', 'Descripción', 'Referencia', 'Notas', 'Creado'];
      const rows = transactions.map(tx => [
        String(tx.id),
        tx.transactionDate ? new Date(tx.transactionDate).toLocaleDateString('es-ES') : '',
        tx.type === 'income' ? 'Ingreso' : 'Gasto',
        tx.category,
        (tx.amount / 100).toFixed(2),
        tx.currency || 'EUR',
        escCsv(tx.description || ''),
        escCsv(tx.reference || ''),
        escCsv(tx.notes || ''),
        tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('es-ES') : ''
      ]);
      
      let totalIncome = 0;
      let totalExpenses = 0;
      transactions.forEach(tx => {
        if (tx.type === 'income') totalIncome += tx.amount;
        else totalExpenses += Math.abs(tx.amount);
      });
      
      rows.push([]);
      rows.push(['', '', 'TOTAL INGRESOS', '', (totalIncome / 100).toFixed(2), 'EUR', '', '', '', '']);
      rows.push(['', '', 'TOTAL GASTOS', '', (-totalExpenses / 100).toFixed(2), 'EUR', '', '', '', '']);
      rows.push(['', '', 'BALANCE NETO', '', ((totalIncome - totalExpenses) / 100).toFixed(2), 'EUR', '', '', '', '']);
      
      const csvContent = [headers.join(';'), ...rows.map(r => (r as string[]).join(';'))].join('\n');
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="transacciones_exentax_${new Date().toISOString().slice(0, 10)}.csv"`);
      res.send('\uFEFF' + csvContent);
    } catch (err) {
      log.error("Error exporting CSV", err);
      res.status(500).json({ message: "Error exporting CSV" });
    }
  }));
}
