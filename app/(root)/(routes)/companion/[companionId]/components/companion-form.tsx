'use client';

import * as z from 'zod';
import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { Category, Companion } from '@prisma/client';
import { useForm } from 'react-hook-form';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { ImageUpload } from '@/components/image-upload';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface CompanionFormProps {
  initialData: Companion | null;
  categories: Category[];
}

const formSchema = z.object({
  name: z.string().nonempty({ message: 'Name is required' }),
  description: z.string().nonempty({ message: 'Description is required' }),
  instructions: z.string().min(200, { message: 'Instruction is required' }),
  seed: z.string().min(200, { message: 'Seed is required' }),
  src: z.string().nonempty({ message: 'Image URL is required' }),
  categoryId: z.string().nonempty({ message: 'Category is required' })
});

const PREAMBLE = `This AI embodies the wisdom and Stoic philosophy of Lucius Annaeus Seneca, the Roman statesman, playwright, and philosopher. Seneca's responses emphasize rational thought, resilience, and inner tranquility in the face of adversity. He encourages self-reflection, control over emotions, and a focus on what is within one's power. His tone is measured, insightful, and occasionally poetic, drawing from his extensive writings on virtue, fate, and human nature.`;

const SEED_CHAT = `User: I had a terrible day at work. My boss unfairly criticized me in front of my colleagues, and I felt humiliated. It ruined my whole day.

Seneca AI: It is not the words of another that harm you, but the judgment you place upon them. Your boss’s criticism—fair or not—is but noise, powerless unless you grant it dominion over your peace.

Consider this: If the criticism is just, then it is a lesson, a chance to improve. If it is unjust, then it is the failing of another, not your own. Would you permit a passerby in the street to dictate your happiness? Then why give such power to a fleeting moment at work?

The day was not ruined, only your perception of it. You still breathed, thought, and moved through the hours. Let this moment pass like a cloud in the sky—acknowledged, but not clung to. True strength lies not in avoiding hardship but in enduring it with a mind unshaken.

What matters now is not what was said, but how you will proceed. Will you dwell, or will you grow?`;

export default function CompanionForm({
  initialData,
  categories
}: CompanionFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      description: '',
      instructions: '',
      seed: '',
      src: '',
      categoryId: undefined
    }
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (initialData) {
        // Update existing companion
        await axios.patch(`/api/companion/${initialData.id}`, values);

        toast({
          description: 'Your companion has been updated successfully'
        });
      } else {
        // Create new companion
        await axios.post('/api/companion', values);

        toast({
          description: 'Your companion has been created successfully'
        });
      }

      router.refresh();
      router.push('/');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while submitting the form',
        variant: 'destructive'
      });
      console.error('Error submitting form', error);
    }
  };

  return (
    <div className='h-full p-4 space-y-2 max-w-3xl mx-auto'>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-8 pb-10'>
          <div className='space-y-2 w-full'>
            <div>
              <h3 className='text-lg font-medium'>General Information</h3>
              <p className='text-sm text-muted-foreground'>
                General information about your companion
              </p>
            </div>
            <Separator className='bg-primary/10' />
          </div>
          <FormField
            name='src'
            render={({ field }) => (
              <FormItem className='flex flex-col items-center justify-center space-y-4'>
                <FormControl>
                  <ImageUpload
                    disabled={isLoading}
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <FormField
              name='name'
              control={form.control}
              render={({ field }) => (
                <FormItem className='col-span-2 md:col-span-1'>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder='Enter companion name...'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This is your AI companion's name
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name='description'
              control={form.control}
              render={({ field }) => (
                <FormItem className='col-span-2 md:col-span-1'>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder='Enter companion description...'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Short description for your AI companion
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name='categoryId'
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    disabled={isLoading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className='bg-background'>
                        <SelectValue
                          defaultValue={field.value}
                          placeholder='Select a category...'
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select a category for your AI companion
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className='space-y-2 w-full'>
            <div>
              <h3 className='text-lg font-medium'>Configuration</h3>
              <p className='text-sm text-muted-foreground'>
                Detailed instructions for your AI companion behavior
              </p>
            </div>
            <Separator className='bg-primary/10' />
          </div>
          <FormField
            name='instructions'
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instructions</FormLabel>
                <FormControl>
                  <Textarea
                    className='bg-background resize-none'
                    rows={7}
                    disabled={isLoading}
                    placeholder={PREAMBLE}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Describe in detail your AI companion's behavior
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name='seed'
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Example Conversation</FormLabel>
                <FormControl>
                  <Textarea
                    className='bg-background resize-none overflow-y-scroll'
                    rows={8}
                    disabled={isLoading}
                    placeholder={SEED_CHAT}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Enter an example conversation with your AI companion
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='w-full flex justify-center'>
            <Button disabled={isLoading} size='lg'>
              {initialData ? 'Update Companion' : 'Create Companion'}
              <Wand2 className='ml-2' />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
