'use client';

import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@clerk/nextjs';

const UserAvatar = () => {
  const { user } = useUser();

  if (!user) return null;

  const src = user.imageUrl;

  return (
    <Avatar className='h-12 w-12'>
      <AvatarImage src={src} />
    </Avatar>
  );
};

export default UserAvatar;
