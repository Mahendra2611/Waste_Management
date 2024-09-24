import {db} from "./dbConfig"
import { Users,Notifications ,Transactions} from "./schema"
import { eq,sql,and,desc } from "drizzle-orm"
export async function createUser(email:string,name:string){
    try {
        const [user] = await db.insert(Users).values({email,name}).returning().execute();
        return user
    } catch (error) {
        console.error('Error creating user', error)
        return null;
    }
}

export async function getUserByEmail(email:string){
    try {
        const [user] = await db.select().from(Users).where(eq(Users.email , email))
        return user
        
    } catch (error) {
        console.error('Error fetching user by email', error)
        return null;
    }
}
export async function getUnreadNotification(userId:number) {
    try {
        return await db.select().from(Notifications).where(and(eq(Notifications.userId,userId),eq(Notifications.isRead,false))).execute()
    } catch (error) {
        console.error('Error fetching notification', error)
        return null;
    }
}
export async function getUserBalance(userId:number):Promise<number>{
    try {
       const transaction = await getRewardTransaction(userId)||[]
       if(!transaction)return 0;
       const balance = transaction.reduce((acc,transaction:any)=>{
        return transaction.type.startsWith('earned')?acc+transaction.amount:acc-transaction.amount
       },0)
       return Math.max(balance,0)
    }
     catch (error) {
        console.error('Error fetching user balance', error)
        return 0;
    }
}
async function getRewardTransaction(userId:number) {
   try {
    const transactions = await db.select({
        type:Transactions.type,
        amount:Transactions.amount,
        description:Transactions.description,
        date:Transactions.date
    }).from(Transactions).where(eq(Transactions.userId,userId)).orderBy(desc(Transactions.date)).limit(10).execute();

    const formattedTransaction = transactions.map(t=>(
         {
            ...t,
            date:t.date.toISOString().split('T')[0] //YYYY-MM-DD
        }
    )
    )
    return formattedTransaction

   } catch (error) {
    console.error('Error fetching reward transaction', error)
    return null;
   }
}
export async function markNotificationRead(notificationId:number) {
    try {
        await db.update(Notifications).set({isRead:true}).where(eq(Notifications.id,notificationId)).execute()
        
    } catch (error) {
        console.error('Error fmark Notifiction as read', error)
        return null;
    }
}