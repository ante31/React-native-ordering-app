import { View, Text } from "react-native";

const NetworkError = ({ isCroatianLanguage }: { isCroatianLanguage: boolean }) => {
  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    }}>
      <Text style={{
        fontSize: 18,
        color: '#D32F2F', // error red
        fontWeight: '600',
        textAlign: 'center',
      }}>
        {isCroatianLanguage ? "⚠️ Greška. Molimo provjerite vezu i pokušajte ponovo." : "⚠️ Network error. Please check your connection and try again."}
      </Text>
    </View>
  );
};

export default NetworkError;