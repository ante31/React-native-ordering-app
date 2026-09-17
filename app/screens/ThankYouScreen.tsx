import { Text, View, BackHandler, StyleSheet, Image, TouchableOpacity, Animated } from "react-native";
import { useEffect, useRef, useState } from "react";
import { scale } from "../services/scale";
import { io } from "socket.io-client";
import { backendUrl } from "@/localhostConf";
import { safeFetch } from "../services/safeFetch";

type OrderStatus = 'pending' | 'accepted' | 'rejected' | 'auto-rejected' | 'completed';

function MorphLoader() {
  return (
    <Image
      source={require('../assets/morphing-loader.gif')}
      style={{ width: 280, height: 280 }}
    />
  );
}

export default function ThankYouScreen({ route, navigation }: any) {
  const { isCroatianLang, orderId, orderDate, notificationResult, isPreOrder } = route.params;
  const styles = getStyles(scale);

  const [status, setStatus] = useState<OrderStatus>('pending');
  // Preorder → odmah prikaži sliku, bez čekanja
  const [revealed, setRevealed] = useState(isPreOrder === true);

  // Prati je li već dobiven konačan odgovor (socket ili polling) da se ne triggerira dvaput
  const resolvedRef = useRef(false);

  const waitingOpacity = useRef(new Animated.Value(isPreOrder ? 0 : 1)).current;
  const imageScale = useRef(new Animated.Value(isPreOrder ? 1 : 0)).current;
  const imageOpacity = useRef(new Animated.Value(isPreOrder ? 1 : 0)).current;

  const revealImage = () => {
    Animated.timing(waitingOpacity, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      setRevealed(true);
      Animated.parallel([
        Animated.spring(imageScale, { toValue: 1, friction: 5, tension: 70, useNativeDriver: true }),
        Animated.timing(imageOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      ]).start();
    });
  };

  const handleOrderResolved = (s: OrderStatus) => {
    if (resolvedRef.current) return; // Već riješeno, ignoriraj duplikat
    resolvedRef.current = true;
    setStatus(s);
    revealImage();
  };

  useEffect(() => {
    // Preorder — ne čekamo potvrdu, odmah je prikazano
    if (isPreOrder) return;

    if (!orderId) { revealImage(); return; }

    // --- Socket (primarni kanal) ---
    const socket = io(backendUrl, { transports: ['websocket'] });
    socket.on(`order-updated-${orderId}`, (updatedOrder: any) => {
      const s: OrderStatus = updatedOrder.status;
      if (s === 'accepted' || s === 'rejected' || s === 'auto-rejected' || s === 'completed') {
        handleOrderResolved(s);
      }
    });

    // --- Fallback polling svakih 15s ---
    let pollInterval: ReturnType<typeof setInterval> | null = null;

    if (orderDate) {
      const date = new Date(orderDate);
      // Backend čuva narudžbu u lokalnom vremenu (UTC offset koristi server pri pohrani),
      // koristimo UTC vrijednosti jer server u POST radi: time.setMinutes(time.getMinutes() + time.getTimezoneOffset())
      const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
      const year = utcDate.getFullYear();
      const month = String(utcDate.getMonth() + 1).padStart(2, '0');
      const day = String(utcDate.getDate()).padStart(2, '0');

      const poll = async () => {
        if (resolvedRef.current) return; // Već riješeno, ne pollaj više
        try {
          console.log(`Polling ${year}/${month}/${day}/${orderId}`);
          const res = await safeFetch(`${backendUrl}/orders/${year}/${month}/${day}/${orderId}`);
          if (!res.ok) return; // 404 ili greška — preskačemo, pokušat ćemo opet
          const data = await res.json();
          const s: OrderStatus = data?.status;
          console.log(`Status: ${s}`);
          if (s === 'accepted' || s === 'rejected' || s === 'auto-rejected' || s === 'completed') {
            handleOrderResolved(s);
          }
        } catch {
          // Mrežna greška — ignoriramo, polling će pokušati ponovo
        }
      };

      pollInterval = setInterval(poll, 15 * 1000);
    }

    // --- Timeout (10 min — isti kao prije) ---
    const timeout = setTimeout(() => {
      handleOrderResolved('auto-rejected');
    }, 10 * 60 * 1000);

    return () => {
      socket.disconnect();
      clearTimeout(timeout);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [orderId]);

  useEffect(() => {
    const handler = BackHandler.addEventListener("hardwareBackPress", () => {
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      return true;
    });
    return () => handler.remove();
  }, [navigation]);

  const isRejected = status === 'rejected' || status === 'auto-rejected';

  return (
    <View style={styles.container}>

      {/* Waiting */}
      {!revealed && (
        <Animated.View style={[styles.waitingContainer, { opacity: waitingOpacity }]}>
          <MorphLoader />
          <Text style={styles.waitingTitle}>
            {isCroatianLang ? 'Čekamo potvrdu...' : 'Waiting for confirmation...'}
          </Text>
          {!notificationResult && (
            <Text style={styles.notificationHint}>
              {isCroatianLang
                ? 'SMS obavijesti više ne rade. Uključi obavijesti od aplikacije u postavkama kako bi primio/la potvrdu narudžbe.'
                : 'SMS notifications are not working. Enable app notifications in settings to receive your order confirmation.'}
            </Text>
          )}
        </Animated.View>
      )}

      <Animated.View style={[styles.resultContainer, { transform: [{ scale: imageScale }], opacity: imageOpacity }]}>
        {isRejected ? (
          <>
            <Text style={styles.rejectedEmoji}>😔</Text>
            <Text style={styles.boldText}>
              {status === 'auto-rejected'
                ? (isCroatianLang ? 'Narudžba nije zaprimljena. Pokušajte ponovno kasnije.' : 'Order was not accepted. Try again later.')
                : (isCroatianLang ? 'Narudžba nije zaprimljena. Pokušajte ponovno kasnije.' : 'Order was not accepted. Try again later.')}
            </Text>
          </>
        ) : (
          <>
            {isCroatianLang
              ? <Image source={require('../../assets/images/thankYou-cro.png')} style={styles.image} />
              : <Image source={require('../../assets/images/thankYou-eng.png')} style={styles.image} />
            }
            <View style={styles.textContainer}>
              {isPreOrder
                ? <Text style={styles.boldText}>
                    {isCroatianLang
                      ? 'Narudžba je zaprimljena! Potvrdu ćete primiti kada restoran otvori.'
                      : 'Order received! You will be notified when the restaurant opens.'}
                  </Text>
                : <Text style={styles.lightText}>{isCroatianLang ? 'Vaša narudžba je zaprimljena.' : 'Your order has been received.'}</Text>
              }
            </View>
          </>
        )}

        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Home', params: { orderCompleted: true, pointsAdded: 20 } }] })}
            style={styles.button}
          >
            <Text allowFontScaling={false} style={styles.buttonText}>{isCroatianLang ? 'Natrag' : 'Back'}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

    </View>
  );
}

const getStyles = (scale: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitingContainer: {
    alignItems: 'center',
    gap: 40,
    padding: 40,
  },
  waitingTitle: {
    fontFamily: 'Lexend_400Regular',
    fontSize: scale.light(16),
    color: '#888',
    letterSpacing: 0.3,
  },
  notificationHint: {
    fontFamily: 'Lexend_400Regular',
    fontSize: scale.light(12),
    color: '#aaa',
    textAlign: 'center',
    marginHorizontal: 30,
    lineHeight: 18,
  },
  resultContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  image: {
    width: 250,
    height: 250,
    marginBottom: 20,
  },
  rejectedEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  textContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    marginHorizontal: 20,
  },
  boldText: {
    fontSize: 20,
    fontFamily: 'Lexend_700Bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  lightText: {
    textAlign: 'center',
    fontFamily: 'Lexend_400Regular',
    fontSize: 16,
    color: '#666',
  },
  buttonWrapper: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  button: {
    height: scale.isTablet() ? 100 : 50,
    backgroundColor: '#ffd400',
    padding: 15,
    borderRadius: 5,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: 'Lexend_700Bold',
    lineHeight: scale.isTablet() ? 50 : 20,
    fontSize: scale.isTablet() ? 30 : 17,
    color: '#fff',
  },
});

