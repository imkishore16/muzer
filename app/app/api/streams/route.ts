import { NextRequest, NextResponse } from "next/server";
import {z} from "zod";
import {prismaClient} from "@/app/lib/db"
import { YT_REGEX } from "@/app/lib/utils";
//@ts-ignore
import youtubesearchapi  from "youtube-search-api";
import { getServerSession } from "next-auth";

//creating a requuest schema
const createStreamSchema = z.object({
    creatorId:z.string(),
    url: z.string().refine((url) => url.includes('youtube') || url.includes('spotify'), {
        message: 'URL must contain either "youtube" or "spotify"',
      }),
})

const SPOTIFY_REGEX = new RegExp("^((spotify:track:)|(https?:\/\/((open)| (play)).spotify.com\/((track)| (album)|(artist))\/))([a-zA-Z0-9]+)$");

const MAX_QUEUE_LEN = 20;


// add rate limiting for a single user , ie how many time he can make this post api within an interval
export async function POST(req:NextRequest){
    
    try{
        const data = createStreamSchema.parse(await req.json())
        const isYt = YT_REGEX.test(data.url)
        console.log(data.url)
        console.log(isYt)
        const isSpotify = SPOTIFY_REGEX.test(data.url)

        if(!isYt && !isSpotify){
            return NextResponse.json(
                {message:"wrong url format"},{status:411}
            )
        }

        //now its either yt or spotify and we need to extract the id
        if(isYt){
            const extractedId = data.url.split("?v=")[1]

            const res = await youtubesearchapi.GetVideoDetails(extractedId);
            const thumbnails = res.thumbnail.thumbnails;
            const title = res.title;

            thumbnails.sort((a:{width:number},b:{width:number})=>a.width < b.width ? -1 : 1);

            const existingActiveStream = await prismaClient.stream.count({
                where: {
                    userId: data.creatorId
                }
            })
            if(existingActiveStream > MAX_QUEUE_LEN){
                return NextResponse.json({message:"Queue already at limit"},{status:411})
            }

            const stream= await prismaClient.stream.create({
                data:{
                    userId:data.creatorId,
                    url:data.url,
                    extractedId,
                    type:"Youtube",
                    title:title ?? "cant find title",
                    bigImg:thumbnails[thumbnails.length-1].url ?? "https://commons.wikimedia.org/wiki/File:No-Image-Placeholder.svg",
                    smallImg:(thumbnails.length>1?thumbnails[thumbnails.length-2].url:thumbnails[thumbnails.length-1].url) ?? "https://commons.wikimedia.org/wiki/File:No-Image-Placeholder.svg"
                }
            });
            return NextResponse.json(
                {...stream , hasUpvoted:false,upvotes:0}//,{status:200}
            )
        }

        // if(isSpotify){}
        
    }
    catch(e){
        console.log(e)
        return NextResponse.json(
            {message:e},{status:411}
        )
    }
}

//get the songs/streams that I have added to the queue 
export async function GET(req:NextRequest){
    const session = await getServerSession();

    const creatorId = req.nextUrl.searchParams.get("creatorId")
    if(!creatorId){
        return NextResponse.json({message:"Error"},{status:411})
    }
        

    const user = await prismaClient.user.findFirst({
        where: {
           email: session?.user?.email ?? ""
        }
    });
    if(!user){
        return NextResponse.json({message:"Error"},{status:411})
    }

    
    const [streams,activeStream] = await Promise.all([await prismaClient.stream.findMany({
        where:{userId:creatorId ?? ""},
        include:{
            _count:{
                select:{
                    upvotes:true
                }
            },
            upvotes:{
                where:{
                    userId:user?.id
                }
            }
        }
    }),
    prismaClient.currentStream.findFirst({
        where:{
            userId:creatorId,
        },
        include:{
            stream:true
        }
    })
])
    console.log(streams)
    return NextResponse.json({
        streams:streams.map(({_count,...rest})=>({...rest,upvotes:_count.upvotes , hasUpvoted:rest.upvotes.length?true : false})),
        activeStream
    })
}


// to fetch all songs in the queue