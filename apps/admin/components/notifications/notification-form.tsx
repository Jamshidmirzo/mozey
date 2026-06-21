'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { api } from '@/lib/api';
import { API_PATHS } from '@/lib/constants';

const notificationSchema = z.object({
  title: z.string().min(1, 'validation.required'),
  body: z.string().min(1, 'validation.required'),
});

type NotificationFormValues = z.infer<typeof notificationSchema>;

export function NotificationForm() {
  const t = useTranslations('notifications');

  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: { title: '', body: '' },
  });

  const sendMutation = useMutation({
    mutationFn: (data: NotificationFormValues) =>
      api.post(API_PATHS.ADMIN_NOTIFICATIONS_SEND, data),
    onSuccess: () => {
      toast.success(t('sent'));
      form.reset();
    },
    onError: () => {
      toast.error(t('error'));
    },
  });

  function onSubmit(data: NotificationFormValues) {
    sendMutation.mutate(data);
  }

  return (
    <Card className="max-w-2xl p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('pushTitle')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('pushTitlePlaceholder')}
                    disabled={sendMutation.isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="body"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('pushBody')}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t('pushBodyPlaceholder')}
                    disabled={sendMutation.isPending}
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={sendMutation.isPending}
            className="w-full sm:w-auto"
          >
            <Send className="mr-2 h-4 w-4" />
            {sendMutation.isPending ? t('sending') : t('send')}
          </Button>
        </form>
      </Form>
    </Card>
  );
}
