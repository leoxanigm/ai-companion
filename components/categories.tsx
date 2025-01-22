'use client';

import { Category } from '@prisma/client';
import { useRouter, useSearchParams } from 'next/navigation';
import qs from 'query-string';

import { cn } from '@/lib/utils';

interface CategoriesProps {
  data: Category[];
}

const Categories = ({ data }: CategoriesProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const categoryId = searchParams.get('categoryId');

  const onClick = (id: string | undefined) => {
    const query = { categoryId: id };

    const url = qs.stringifyUrl(
      {
        url: window.location.href,
        query
      },
      { skipNull: true }
    );

    router.push(url);
  };

  const CategoryButton = ({
    children,
    className,
    onClick
  }: {
    children: React.ReactNode;
    className?: string;
    onClick: () => void;
  }) => {
    console.log(className);
    return (
      <button
        onClick={onClick}
        className={cn(
          `
          flex items-center
          text-center text-sm md:text-sm
          px-2 md:px-4 py-2 md:py-3
          rounded-md
          bg-primary/10
          hover:opacity-75
          transition
          `,
          className
        )}>
        {children}
      </button>
    );
  };

  return (
    <div className='w-full overflow-x-auto flex space-x-2 p-1'>
      <CategoryButton
        className={!categoryId ? 'bg-primary/25' : 'bg-primary/10'}
        onClick={() => onClick(undefined)}>
        Newest
      </CategoryButton>

      {data.map(item => (
        <CategoryButton
          key={item.id}
          className={item.id === categoryId ? 'bg-primary/25' : 'bg-primary/10'}
          onClick={() => onClick(item.id)}>
          {item.name}
        </CategoryButton>
      ))}
    </div>
  );
};

export default Categories;
