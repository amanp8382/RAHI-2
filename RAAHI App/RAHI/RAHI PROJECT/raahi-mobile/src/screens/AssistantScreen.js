import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import ScreenShell from '../components/ScreenShell';
import TopBar from '../components/TopBar';
import InfoCard from '../components/InfoCard';
import { apiService } from '../services/api';
import { storage } from '../services/storage';
import colors from '../theme/colors';

const quickPrompts = [
  'Is this area safe after sunset?',
  'Give me tourist safety tips for my destination.',
  'What should I do if I lose my documents?'
];

export default function AssistantScreen({ navigation }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [tips, setTips] = useState([]);

  useEffect(() => {
    let active = true;

    const loadInitial = async () => {
      const [savedMessages, recommendations] = await Promise.all([
        storage.getChatHistory(),
        apiService.getSafetyRecommendations('Current trip')
      ]);

      if (!active) return;
      setMessages(savedMessages);
      setTips(recommendations.recommendations || []);
    };

    loadInitial();
    return () => {
      active = false;
    };
  }, []);

  const sendMessage = async (overrideMessage) => {
    const message = (overrideMessage || input).trim();
    if (!message) return;

    const nextUserMessage = { id: `${Date.now()}_user`, role: 'user', text: message };
    const nextMessages = [...messages, nextUserMessage];
    setMessages(nextMessages);
    setInput('');
    setIsSending(true);

    try {
      const response = await apiService.getChatbotReply(message);
      const assistantMessage = {
        id: `${Date.now()}_assistant`,
        role: 'assistant',
        text: response.message
      };
      const finalMessages = [...nextMessages, assistantMessage];
      setMessages(finalMessages);
      await storage.setChatHistory(finalMessages);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <ScreenShell>
      <TopBar
        title="AI Assistant"
        subtitle="Context-aware safety answers for tourists"
        onMenuPress={() => navigation.openDrawer()}
        onProfilePress={() => navigation.navigate('Profile')}
      />

      <InfoCard eyebrow="Quick prompts" title="Start with a common question">
        <View style={styles.promptGrid}>
          {quickPrompts.map((prompt) => (
            <Pressable key={prompt} style={styles.promptChip} onPress={() => sendMessage(prompt)}>
              <Text style={styles.promptText}>{prompt}</Text>
            </Pressable>
          ))}
        </View>
      </InfoCard>

      <InfoCard eyebrow="Chat" title="Safety support">
        {!messages.length ? <Text style={styles.muted}>Ask a question to begin your AI-supported travel guidance.</Text> : null}
        {messages.map((message) => (
          <View key={message.id} style={[styles.messageBubble, message.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
            <Text style={[styles.messageText, message.role === 'user' && styles.userText]}>{message.text}</Text>
          </View>
        ))}
        {isSending ? <ActivityIndicator color={colors.primary} /> : null}
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask about safety, transport, local guidance..."
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          multiline
        />
        <Pressable style={styles.sendButton} onPress={() => sendMessage()}>
          <Text style={styles.sendButtonText}>Send message</Text>
        </Pressable>
      </InfoCard>

      <InfoCard eyebrow="Recommendations" title="Safety advice for right now">
        {tips.map((tip) => (
          <View key={tip} style={styles.tipRow}>
            <View style={styles.dot} />
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </InfoCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  promptGrid: {
    gap: 10
  },
  promptChip: {
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fcf7f2'
  },
  promptText: {
    color: colors.text,
    fontWeight: '600'
  },
  messageBubble: {
    borderRadius: 18,
    padding: 14
  },
  userBubble: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-end'
  },
  assistantBubble: {
    backgroundColor: '#efe4d9',
    alignSelf: 'flex-start'
  },
  messageText: {
    color: colors.text,
    lineHeight: 21
  },
  userText: {
    color: '#ffffff'
  },
  muted: {
    color: colors.textMuted
  },
  input: {
    minHeight: 90,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    textAlignVertical: 'top'
  },
  sendButton: {
    minHeight: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary
  },
  sendButtonText: {
    color: '#ffffff',
    fontWeight: '700'
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginTop: 6
  },
  tipText: {
    flex: 1,
    color: colors.text,
    lineHeight: 22
  }
});
