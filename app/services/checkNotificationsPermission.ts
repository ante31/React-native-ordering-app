import * as Notifications from 'expo-notifications';

export const checkNotificationPermission = async () => {
  const { status } = await Notifications.getPermissionsAsync();

  if (status === 'granted') {
    return true;
  } else {
    return false;
  }
};