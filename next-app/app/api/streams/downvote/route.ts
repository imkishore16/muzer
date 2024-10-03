import { NextRequest, NextResponse } from "next/server";
import {z} from "zod";
import {prismaClient} from "@/app/lib/db"
import { getServerSession } from "next-auth";


const upvoteSchema = z.object({
    streamId:z.string()
})

export async function POST(req:NextRequest){
    const session = await getServerSession();

    //TODO : u can get rid of the db call here and replace email with the id of a user
    const user = await prismaClient.user.findFirst({
        where:{
            email:session?.user?.email ?? ""
        }
    })
    
    if(!user)
    {
        return NextResponse.json({message:"Unauthenticated user"},{status:403})

    }
    try {
        const data = upvoteSchema.parse(await req.json());
        await prismaClient.upvote.delete({where:{userId_streamId:{userId:user.id,streamId:data.streamId}}})
        return NextResponse.json({message:"Downvoted"},{status:200})
    } catch (error) {
        return NextResponse.json({message:"Error while upvoting"},{status:411})
    }
}