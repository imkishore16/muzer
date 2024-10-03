"use client"
import { useSession } from 'next-auth/react'

import StreamView2 from '@/app/components/streamView2'
import useRedirect from '@/app/hooks/useRedirect';

export default function Component() {
    const session = useSession();
    try {
        if (!session.data?.user.id) {
            return (
                <h1>Please Log in....</h1>
            )
        }
        return <StreamView2 creatorId={session.data.user.id} playVideo={true} />
    } catch(e) {
        return null
    }
}

export const dynamic = 'auto'