import { PrismaClient } from "@prisma/client";
export const prismaClient = new PrismaClient();

// whenever you create a schema , you migrate your db , and create your client so that only one instance is created at anytime

// import { PrismaClient } from '@prisma/client';

// class PrismaSingleton {
//   private static instance: PrismaSingleton;
//   public prisma: PrismaClient;

//   private constructor() {
//     this.prisma = new PrismaClient();
//   }

//   public static getInstance(): PrismaSingleton {
//     if (!PrismaSingleton.instance) {
//       PrismaSingleton.instance = new PrismaSingleton();
//     }
//     return PrismaSingleton.instance;
//   }
// }

// export default PrismaSingleton;