import React, { useState } from 'react';
import { View } from 'react-native';
import { Phone, Send } from 'lucide-react-native';
import {
  AppHeader,
  Avatar,
  IconButton,
  ScrollContainer,
  Surface,
  TextField,
  Touchable,
  Typography,
  useTheme,
} from '../../design-system';
import { ScreenScaffold } from '../_shared/ScreenScaffold';
import { formatTime } from '../../utils/format';
import type { ChatMessage } from '../../types';

export interface CourierChatScreenProps {
  courierName: string;
  courierAvatarUrl?: string;
  messages: ChatMessage[];
  quickReplies?: string[];
  sending?: boolean;
  onSend?: (text: string) => void;
  onCall?: () => void;
  onBack?: () => void;
}

/**
 * Müşteri ↔ kurye mesajlaşma (teslimat takibinden açılır). Hazır mesajlar
 * tek dokunuşla gönderilir; arama başlıktaki telefon ikonundan.
 */
export function CourierChatScreen({
  courierName,
  courierAvatarUrl,
  messages,
  quickReplies = [],
  sending = false,
  onSend,
  onCall,
  onBack,
}: CourierChatScreenProps) {
  const theme = useTheme();
  const [text, setText] = useState('');

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend?.(trimmed);
    setText('');
  };

  return (
    <ScreenScaffold
      header={
        <AppHeader
          title={courierName}
          subtitle="Kurye"
          onBack={onBack}
          leading={<Avatar name={courierName} imageUrl={courierAvatarUrl} size="sm" />}
          actions={onCall ? [{ icon: Phone, accessibilityLabel: 'Kuryeyi ara', onPress: onCall }] : []}
          bordered
        />
      }
      footer={
        <View style={{ gap: theme.spacing.sm }}>
          {quickReplies.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs }}>
              {quickReplies.map((reply) => (
                <Touchable
                  key={reply}
                  onPress={() => onSend?.(reply)}
                  feedback="opacity"
                  accessibilityLabel={`Hazır mesaj: ${reply}`}
                >
                  <View
                    style={{
                      paddingVertical: theme.spacing.xs,
                      paddingHorizontal: theme.spacing.md,
                      borderRadius: theme.radius.full,
                      backgroundColor: theme.colors.action.secondary,
                    }}
                  >
                    <Typography variant="micro" tone="accent" weight="semibold">
                      {reply}
                    </Typography>
                  </View>
                </Touchable>
              ))}
            </View>
          )}
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: theme.spacing.sm }}>
            <View style={{ flex: 1 }}>
              <TextField
                value={text}
                onChangeText={setText}
                placeholder="Mesaj yaz…"
                onSubmitEditing={submit}
                returnKeyType="send"
              />
            </View>
            <IconButton
              icon={Send}
              accessibilityLabel="Gönder"
              variant="filled"
              size="lg"
              onPress={submit}
              disabled={sending || text.trim().length === 0}
            />
          </View>
        </View>
      }
    >
      <ScrollContainer>
        <View style={{ gap: theme.spacing.md, paddingVertical: theme.spacing.md }}>
          {messages.map((message) => {
            const mine = message.sender === 'customer';
            return (
              <View
                key={message.id}
                style={{ alignItems: mine ? 'flex-end' : 'flex-start' }}
              >
                <View style={{ maxWidth: '82%', gap: 2, alignItems: mine ? 'flex-end' : 'flex-start' }}>
                  {mine ? (
                    <View
                      style={{
                        backgroundColor: theme.colors.action.primary,
                        paddingVertical: theme.spacing.sm,
                        paddingHorizontal: theme.spacing.md,
                        borderRadius: theme.radius.lg,
                      }}
                    >
                      <Typography variant="body" tone="inverse">
                        {message.text}
                      </Typography>
                    </View>
                  ) : (
                    <Surface tone="elevated" radius="lg" padding="md" bordered>
                      <Typography variant="body">{message.text}</Typography>
                    </Surface>
                  )}
                  <Typography variant="tiny" tone="muted">
                    {formatTime(message.at)}
                  </Typography>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollContainer>
    </ScreenScaffold>
  );
}
