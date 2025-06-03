import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { MoreVertical } from 'lucide-react-native';
import TimeAgo from '@/components/time';

type NotificationItemProps = {
    item: {
      id: number;
      post_id: string;
      message: string;
      created_at: string;
      is_read: boolean;
  };
  
  handleNotificationPress: () => void;
};

const NotificationItem = ({ item, handleNotificationPress }: NotificationItemProps) => {
  const notification = item;

  return (
    <TouchableOpacity key={notification.id} style={styles.notificationItem} onPress={handleNotificationPress}>
      <View style={styles.notificationContent}>
        {notification.is_read === false && <View style={styles.unreadDot} />}
        <View style={styles.textContainer}>
          <Text style={styles.notificationText} numberOfLines={2}>
            {notification.message}
          </Text>
          <Text style={styles.timeText}>
            <TimeAgo time_string={notification.created_at} />
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.moreButton}>
        <MoreVertical size={20} color="#666" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6E42',
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
  },
  notificationText: {
    fontSize: 14,
    color: '#000',
    flexShrink: 1,
  },
  timeText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  moreButton: {
    padding: 8,
  },
});

export default NotificationItem;
