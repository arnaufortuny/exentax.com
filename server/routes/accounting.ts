import type { Express } from "express";
import { db, isAdmin, logAudit } from "./shared";
import { accountingTransactions } from "@shared/schema";
import { and, eq, desc, sql } from "drizzle-orm";

export function registerAccountingRoutes(app: Express) {
  // Get all transactions with filters
  app.get("/api/admin/accounting/transactions", isAdmin, async (req, res) => {
    try {
      const { type, category, startDate, endDate } = req.query;
      
      let query = db.select().from(accountingTransactions);
      const conditions: any[] = [];
      
      if (type && typeof type === 'string') {
        conditions.push(eq(accountingTransactions.type, type));
      }
      if (category && typeof category === 'string') {
        conditions.push(eq(accountingTransactions.category, category));
      }
      if (startDate && typeof startDate === 'string') {
        conditions.push(sql`${accountingTransactions.transactionDate} >= ${new Date(startDate)}`);
      }
      if (endDate && typeof endDate === 'string') {
        conditions.push(sql`${accountingTransactions.transactionDate} <= ${new Date(endDate)}`);
      }
      
      const transactions = await db.select()
        .from(accountingTransactions)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(accountingTransactions.transactionDate));
      
      res.json(transactions);
    } catch (err) {
      console.error("Error fetching accounting transactions:", err);
      res.status(500).json({ message: "Error fetching transactions" });
    }
  });
  
  // Get accounting summary/stats
  app.get("/api/admin/accounting/summary", isAdmin, async (req, res) => {
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
      console.error("Error fetching accounting summary:", err);
      res.status(500).json({ message: "Error fetching accounting summary" });
    }
  });
  
  // Create transaction
  app.post("/api/admin/accounting/transactions", isAdmin, async (req: any, res) => {
    try {
      const { type, category, amount, currency, description, orderId, userId, reference, transactionDate, notes } = req.body;
      
      if (!type || !category || amount === undefined) {
        return res.status(400).json({ message: "Missing required data" });
      }
      
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
      console.error("Error creating transaction:", err);
      res.status(500).json({ message: "Error creating transaction" });
    }
  });
  
  // Update transaction
  app.patch("/api/admin/accounting/transactions/:id", isAdmin, async (req: any, res) => {
    try {
      const txId = Number(req.params.id);
      const { type, category, amount, currency, description, reference, transactionDate, notes } = req.body;
      
      const updateData: Record<string, any> = { updatedAt: new Date() };
      if (type) updateData.type = type;
      if (category) updateData.category = category;
      if (amount !== undefined) {
        const amountCents = Math.round(Number(amount) * 100);
        updateData.amount = type === 'expense' ? -Math.abs(amountCents) : Math.abs(amountCents);
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
      console.error("Error updating transaction:", err);
      res.status(500).json({ message: "Error updating transaction" });
    }
  });
  
  // Delete transaction
  app.delete("/api/admin/accounting/transactions/:id", isAdmin, async (req: any, res) => {
    try {
      const txId = Number(req.params.id);
      
      await db.delete(accountingTransactions).where(eq(accountingTransactions.id, txId));
      
      logAudit({
        action: 'accounting_transaction_deleted',
        userId: req.session?.userId,
        targetId: String(txId)
      });
      
      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting transaction:", err);
      res.status(500).json({ message: "Error deleting transaction" });
    }
  });
  
  // Export transactions to CSV
  app.get("/api/admin/accounting/export-csv", isAdmin, async (req, res) => {
    try {
      const { startDate, endDate, type, category } = req.query;
      
      const conditions: any[] = [];
      if (type && typeof type === 'string') {
        conditions.push(eq(accountingTransactions.type, type));
      }
      if (category && typeof category === 'string') {
        conditions.push(eq(accountingTransactions.category, category));
      }
      if (startDate && typeof startDate === 'string') {
        conditions.push(sql`${accountingTransactions.transactionDate} >= ${new Date(startDate)}`);
      }
      if (endDate && typeof endDate === 'string') {
        conditions.push(sql`${accountingTransactions.transactionDate} <= ${new Date(endDate)}`);
      }
      
      const transactions = await db.select()
        .from(accountingTransactions)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(accountingTransactions.transactionDate));
      
      // Build CSV
      const headers = ['ID', 'Fecha', 'Tipo', 'Categoría', 'Importe (€)', 'Descripción', 'Referencia', 'Notas'];
      const rows = transactions.map(tx => [
        tx.id,
        tx.transactionDate ? new Date(tx.transactionDate).toLocaleDateString('es-ES') : '',
        tx.type === 'income' ? 'Ingreso' : 'Gasto',
        tx.category,
        (tx.amount / 100).toFixed(2),
        tx.description || '',
        tx.reference || '',
        tx.notes || ''
      ]);
      
      const csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="transacciones_${new Date().toISOString().slice(0, 10)}.csv"`);
      res.send('\uFEFF' + csvContent); // BOM for Excel UTF-8
    } catch (err) {
      console.error("Error exporting CSV:", err);
      res.status(500).json({ message: "Error exporting CSV" });
    }
  });
}
