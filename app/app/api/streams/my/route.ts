import { NextRequest, NextResponse } from "next/server";
import {z} from "zod";
import {prismaClient} from "@/app/lib/db"
import { getServerSession } from "next-auth";



export async function GET(req:NextRequest){
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
        const streams = await prismaClient.stream.findMany({
            where:{
                userId:user.id
            },
            include:{
                _count:{
                    select:{
                         upvotes:true
                    }
                },
                upvotes:{
                    where:{
                        userId:user.id
                    }
                }
            }
        })
        return NextResponse.json({
            streams:streams.map(({_count,...rest})=>({
                ...rest,
                upvotes:_count.upvotes,
                haveUpvoted : rest.upvotes.length ? true : false

            }))
        },{status:200})
    } catch (error) {
        return NextResponse.json({message:"Error while upvoting"},{status:411})
    }
}