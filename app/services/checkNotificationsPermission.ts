import * as Notifications from 'expo-notifications';

export const checkNotificationPermission = async () => {
  const { status } = await Notifications.getPermissionsAsync();

  if (status === 'granted') {
    // Korisnik je dopustio notifikacije
    return true;
  } else {
    // Nije dopušteno (može biti 'denied' ili 'undetermined')
    return false;
  }
};