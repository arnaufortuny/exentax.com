import { db } from "./db";
import {
  products, orders, llcApplications, applicationDocuments, newsletterSubscribers,
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
  getOrder(id: number): Promise<Order | undefined>;

  // LLC Applications
  createLlcApplication(app: InsertLlcApplication): Promise<LlcApplication>;
  getLlcApplication(id: number): Promise<LlcApplication | undefined>;
  getLlcApplicationByOrderId(orderId: number): Promise<LlcApplication | undefined>;
  getLlcApplicationByRequestCode(code: string): Promise<(LlcApplication & { documents: ApplicationDocument[] }) | undefined>;
  updateLlcApplication(id: number, updates: Partial<LlcApplication>): Promise<LlcApplication>;
  setLlcApplicationOtp(id: number, otp: string, expires: Date): Promise<void>;
  verifyLlcApplicationOtp(id: number, otp: string): Promise<boolean>;

  // Documents
  createDocument(doc: InsertApplicationDocument): Promise<ApplicationDocument>;
  getDocumentsByApplicationId(applicationId: number): Promise<ApplicationDocument[]>;
  deleteDocument(id: number): Promise<void>;

  // Newsletter
  subscribeToNewsletter(email: string): Promise<void>;
  isSubscribedToNewsletter(email: string): Promise<boolean>;
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
    return newOrder;
  }

  async getOrders(userId: string): Promise<(Order & { product: Product; application: LlcApplication | null })[]> {
    // Perform a join to get order + product + application
    // Drizzle's query builder with relations is cleaner:
    const results = await db.query.orders.findMany({
      where: eq(orders.userId, userId),
      with: {
        product: true,
        application: true,
      },
      orderBy: desc(orders.createdAt),
    });
    return results;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
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
    return result;
  }

  async updateLlcApplication(id: number, updates: Partial<LlcApplication>): Promise<LlcApplication> {
    const [updated] = await db
      .update(llcApplications)
      .set({ ...updates, lastUpdated: new Date() })
      .where(eq(llcApplications.id, id))
      .returning();
    return updated;
  }

  async setLlcApplicationOtp(id: number, otp: string, expires: Date): Promise<void> {
    await db
      .update(llcApplications)
      .set({ emailOtp: otp, emailOtpExpires: expires })
      .where(eq(llcApplications.id, id));
  }

  async verifyLlcApplicationOtp(id: number, otp: string): Promise<boolean> {
    const [app] = await db
      .select()
      .from(llcApplications)
      .where(eq(llcApplications.id, id));
    
    if (!app || !app.emailOtp || !app.emailOtpExpires) return false;
    
    if (app.emailOtp === otp && new Date() < app.emailOtpExpires) {
      await db
        .update(llcApplications)
        .set({ emailVerified: true, emailOtp: null, emailOtpExpires: null })
        .where(eq(llcApplications.id, id));
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
}

export const storage = new DatabaseStorage();
