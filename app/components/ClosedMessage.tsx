import { View, Text } from 'react-native';

export default function OrderDisabledMessage() {
  return (
    <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>
        Aplikacija je zatvorena nakon 23:00
      </Text>
    </View>
  );
}