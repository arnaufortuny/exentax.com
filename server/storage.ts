import { db } from "./db";
import { sql } from "drizzle-orm";
import {
  products, orders, llcApplications, applicationDocuments, newsletterSubscribers,
  maintenanceApplications, messages as messagesTable,
  type Product, type Order, type LlcApplication, type ApplicationDocument,
  insertLlcApplicationSchema, insertApplicationDocumentSchema, insertOrderSchema
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

type InsertOrder = z.infer<typeof insertOrderSchema>;
type InsertLlcApplication = z.infer<typeof insertLlcApplicationSchema>;
type InsertApplicationDocument = z.infer<typeof insertApplicationDocumentSchema>;

export interface IStorage {
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: Omit<Product, "id">): Promise<Product>;

  // Orders
  createOrder(order: InsertOrder): Promise<Order>;
  getOrders(userId: string): Promise<(Order & { product: Product; application: LlcApplication | null })[]>;
  getOrder(id: number): Promise<(Order & { product?: Product; application?: LlcApplication; user?: any }) | undefined>;

  // LLC Applications
  createLlcApplication(app: InsertLlcApplication): Promise<LlcApplication>;
  getLlcApplication(id: number): Promise<LlcApplication | undefined>;
  getLlcApplicationByOrderId(orderId: number): Promise<LlcApplication | undefined>;
  getLlcApplicationByRequestCode(code: string): Promise<(LlcApplication & { documents: ApplicationDocument[] }) | undefined>;
  updateLlcApplication(id: number, updates: Partial<LlcApplication>): Promise<LlcApplication>;
  setOtp(type: 'llc' | 'maintenance', id: number, otp: string, expires: Date): Promise<void>;
  verifyOtp(type: 'llc' | 'maintenance', id: number, otp: string): Promise<boolean>;

  // Documents
  createDocument(doc: InsertApplicationDocument): Promise<ApplicationDocument>;
  getDocumentsByApplicationId(applicationId: number): Promise<ApplicationDocument[]>;
  getDocumentsByOrderIds(orderIds: number[]): Promise<ApplicationDocument[]>;
  deleteDocument(id: number): Promise<void>;

  // Newsletter
  subscribeToNewsletter(email: string): Promise<void>;
  isSubscribedToNewsletter(email: string): Promise<boolean>;

  // Admin
  getAllOrders(): Promise<(Order & { product: Product; application: LlcApplication | null; user: any })[]>;
  updateOrderStatus(orderId: number, status: string): Promise<Order>;

  // Messages
  createMessage(message: any): Promise<any>;
  getMessagesByUserId(userId: string): Promise<any[]>;
  getAllMessages(): Promise<any[]>;
  updateMessageStatus(id: number, status: string): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // Products
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(products.price);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: Omit<Product, "id">): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  // Orders
  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    // Generate 8-digit numeric ID (ORD + Year + 6 random digits)
    const year = new Date().getFullYear().toString().slice(-2);
    const random = Math.floor(100000 + Math.random() * 900000).toString();
    const invoiceNumber = `ORD-${year}${random}`;
    await db.update(orders).set({ invoiceNumber }).where(eq(orders.id, newOrder.id));
    
    // Log for admin
    const [user] = await db.select().from(users).where(eq(users.id, newOrder.userId)).limit(1);
    
    try {
      const { sql } = await import("drizzle-orm");
      const { sendEmail, getEmailHeader, getEmailFooter } = await import("./lib/email");

      await db.insert(sql`activity_logs`).values({
        user_id: newOrder.userId,
        action: "Nuevo Pedido Creado",
        details: { 
          orderId: invoiceNumber, 
          user: user?.email, 
          amount: newOrder.amount / 100 
        },
        ip_address: "system"
      });

      await sendEmail({
        to: "afortuny07@gmail.com",
        subject: `[PEDIDO] Nuevo Pedido Creado: ${invoiceNumber}`,
        html: `
          <div style="background-color: #f9f9f9; padding: 20px 0;">
            <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 8px; overflow: hidden; color: #1a1a1a; background-color: #ffffff; border: 1px solid #e5e5e5;">
              ${getEmailHeader()}
              <div style="padding: 40px;">
                <h2 style="font-size: 18px; font-weight: 800; margin-bottom: 20px; color: #000;">Nuevo Pedido Recibido</h2>
                <div style="background: #f4f4f4; border-left: 4px solid #6EDC8A; padding: 20px; margin: 20px 0;">
                  <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>ID Pedido:</strong> ${invoiceNumber}</p>
                  <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Cliente:</strong> ${user?.email}</p>
                  <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Monto:</strong> $${newOrder.amount / 100}</p>
                </div>
              </div>
              ${getEmailFooter()}
            </div>
          </div>
        `
      });
    } catch (e) {
      console.error("Log error in createOrder:", e);
    }

    return { ...newOrder, invoiceNumber };
  }

  async getOrders(userId?: string): Promise<any[]> {
    if (userId) {
      return await db.query.orders.findMany({
        where: eq(orders.userId, userId),
        with: {
          product: true,
          application: true,
        },
        orderBy: desc(orders.createdAt),
      });
    }
    return await db.query.orders.findMany({
      with: {
        product: true,
        application: true,
        user: true,
      },
      orderBy: desc(orders.createdAt),
    });
  }

  async getOrder(id: number): Promise<(Order & { product?: Product; application?: LlcApplication; user?: any }) | undefined> {
    const result = await db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: {
        product: true,
        application: true,
        user: true,
      },
    });
    return result;
  }

  // LLC Applications
  async createLlcApplication(app: z.infer<typeof insertLlcApplicationSchema>): Promise<LlcApplication> {
    const [newApp] = await db.insert(llcApplications).values(app).returning();
    return newApp;
  }

  async getLlcApplication(id: number): Promise<LlcApplication | undefined> {
    const [app] = await db.select().from(llcApplications).where(eq(llcApplications.id, id));
    return app;
  }

  async getLlcApplicationByOrderId(orderId: number): Promise<LlcApplication | undefined> {
    const [app] = await db.select().from(llcApplications).where(eq(llcApplications.orderId, orderId));
    return app;
  }

  async getLlcApplicationByRequestCode(code: string): Promise<(LlcApplication & { documents: ApplicationDocument[] }) | undefined> {
    const result = await db.query.llcApplications.findFirst({
      where: eq(llcApplications.requestCode, code),
      with: {
        documents: true,
      },
    });
    return result as (LlcApplication & { documents: ApplicationDocument[] }) | undefined;
  }

  async updateLlcApplication(id: number, updates: Partial<LlcApplication>): Promise<LlcApplication> {
    const [updated] = await db
      .update(llcApplications)
      .set({ ...updates, lastUpdated: new Date() })
      .where(eq(llcApplications.id, id))
      .returning();
    return updated;
  }

  async setOtp(type: 'llc' | 'maintenance', id: number, otp: string, expires: Date): Promise<void> {
    const table = type === 'llc' ? llcApplications : maintenanceApplications;
    await db
      .update(table)
      .set({ emailOtp: otp, emailOtpExpires: expires })
      .where(eq(table.id, id));
  }

  async verifyOtp(type: 'llc' | 'maintenance', id: number, otp: string): Promise<boolean> {
    const table = type === 'llc' ? llcApplications : maintenanceApplications;
    const [app] = await db
      .select()
      .from(table)
      .where(eq(table.id, id));
    
    if (!app || !app.emailOtp || !app.emailOtpExpires) return false;
    
    if (app.emailOtp === otp && new Date() < app.emailOtpExpires) {
      await db
        .update(table)
        .set({ emailVerified: true, emailOtp: null, emailOtpExpires: null })
        .where(eq(table.id, id));
      return true;
    }
    return false;
  }

  // Documents
  async createDocument(doc: InsertApplicationDocument): Promise<ApplicationDocument> {
    const [newDoc] = await db.insert(applicationDocuments).values(doc).returning();
    return newDoc;
  }

  async getDocumentsByApplicationId(applicationId: number): Promise<ApplicationDocument[]> {
    return await db.select().from(applicationDocuments).where(eq(applicationDocuments.applicationId, applicationId));
  }

  async getDocumentsByOrderIds(orderIds: number[]): Promise<ApplicationDocument[]> {
    const { inArray } = await import("drizzle-orm");
    if (orderIds.length === 0) return [];
    return await db.select().from(applicationDocuments).where(inArray(applicationDocuments.orderId, orderIds));
  }

  async deleteDocument(id: number): Promise<void> {
    await db.delete(applicationDocuments).where(eq(applicationDocuments.id, id));
  }

  // Newsletter
  async subscribeToNewsletter(email: string): Promise<void> {
    const subscribed = await this.isSubscribedToNewsletter(email);
    if (!subscribed) {
      await db.insert(newsletterSubscribers).values({ email });
    }
  }

  async isSubscribedToNewsletter(email: string): Promise<boolean> {
    const [subscriber] = await db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.email, email));
    return !!subscriber;
  }

  // Admin methods
  async getAllOrders(): Promise<(Order & { product: Product; application: LlcApplication | null; user: any })[]> {
    return await db.query.orders.findMany({
      with: {
        product: true,
        application: true,
        user: true,
      },
      orderBy: desc(orders.createdAt),
    });
  }

  async updateOrderStatus(orderId: number, status: string): Promise<Order> {
    const [updated] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, orderId))
      .returning();
    return updated;
  }

  // Messages
  async createMessage(message: any): Promise<any> {
    const { encrypt } = await import("./utils/encryption");
    // Generate 8-digit message ID (e.g., MSG-26012345)
    const year = new Date().getFullYear().toString().slice(-2);
    const random = Math.floor(100000 + Math.random() * 900000).toString();
    const msgId = `MSG-${year}${random}`;
    
    const encryptedContent = encrypt(message.content);
    const [newMessage] = await db.insert(messagesTable).values({
      ...message,
      messageId: msgId,
      encryptedContent
    }).returning();
    return newMessage;
  }

  async getMessagesByUserId(userId: string): Promise<any[]> {
    return await db.select().from(messagesTable)
      .where(eq(messagesTable.userId, userId))
      .orderBy(desc(messagesTable.createdAt));
  }

  async getAllMessages(): Promise<any[]> {
    return await db.query.messages.findMany({
      orderBy: desc(messagesTable.createdAt),
      with: {
        replies: true
      }
    });
  }

  async updateMessageStatus(id: number, status: string): Promise<any> {
    const [updated] = await db.update(messagesTable)
      .set({ status })
      .where(eq(messagesTable.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
