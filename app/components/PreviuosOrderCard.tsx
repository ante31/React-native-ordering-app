import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Divider } from "react-native-paper"
import { isCroatian } from "../services/languageChecker";
import { appButtonsDisabled } from "../services/isAppClosed";
import { getDayOfTheWeek, getLocalTime, getYearMonthDay } from "../services/getLocalTime";
import { backendUrl } from "@/localhostConf";
import { useGeneral } from "../generalContext";
import { formatEuropeanDateTime } from '../services/toEuropeanDate';
import { safeFetch } from "../services/safeFetch";
import { io } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';

const STATUS_CONFIG: Record<string, { label_hr: string; label_en: string; color: string; icon: any }> = {
  completed:     { label_hr: 'Dovršeno',                    label_en: 'Completed',              color: '#27AE60', icon: 'check-circle' },
  accepted:      { label_hr: 'Prihvaćeno',                  label_en: 'Accepted',               color: '#27AE60', icon: 'check-circle' },
  rejected:      { label_hr: 'Odbijeno',                    label_en: 'Rejected',               color: '#E74C3C', icon: 'cancel' },
  'auto-rejected':{ label_hr: 'Odbijeno (velika gužva)',    label_en: 'Rejected (high demand)', color: '#E74C3C', icon: 'cancel' },
  pending:       { label_hr: 'Čeka se odgovor',             label_en: 'Waiting for response',   color: '#F39C12', icon: 'hourglass-top' },
};

export const PreviousOrderCard = ({ item, handleRenew, handleDelete }: any) => {
  const { general } = useGeneral();
  const isCroatianLang = isCroatian();
  const [order, setOrder] = useState<any>(null);
  const dayOfWeek = getDayOfTheWeek(getLocalTime(), general?.holidays);
  const isDisabled = appButtonsDisabled(general?.appStatus, general?.workTime[dayOfWeek], general?.holidays);

  useEffect(() => {
    console.log('PreviousOrderCard mounted', item);
    if (item.status !== 'pending') return;

    const socket = io(backendUrl, { transports: ['polling', 'websocket'], withCredentials: true });

    const fetchOrder = async () => {
      try {
        const fullDateString = getYearMonthDay(item.time);
        const [year, month, day] = fullDateString.split('-');
        const response = await safeFetch(`${backendUrl}/orders/${year}/${month}/${day}/${item.id}`);
        if (!response.ok) return;
        const data = await response.json();
        setOrder(data);

        // Ako je status konačan (nije više pending), ažuriraj zapis u SecureStore
        // kako se sljedeći put ne bi nepotrebno radio fetch.
        if (data?.status && data.status !== 'pending') {
          try {
            const stored = await SecureStore.getItemAsync(item.id);
            if (stored) {
              const parsed = JSON.parse(stored);
              await SecureStore.setItemAsync(item.id, JSON.stringify({ ...parsed, status: data.status }));
            }
          } catch (storageErr) {
            console.error('SecureStore update failed:', storageErr);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchOrder();

    const eventName = `order-updated-${item.id}`;
    socket.on(eventName, (updatedOrder: any) => {
      setOrder(updatedOrder);

      // Ažuriraj SecureStore i za socket update ako status nije više pending
      if (updatedOrder?.status && updatedOrder.status !== 'pending') {
        SecureStore.getItemAsync(item.id).then(stored => {
          if (!stored) return;
          const parsed = JSON.parse(stored);
          SecureStore.setItemAsync(item.id, JSON.stringify({ ...parsed, status: updatedOrder.status }))
            .catch(err => console.error('SecureStore socket update failed:', err));
        }).catch(err => console.error('SecureStore read failed:', err));
      }
    });

    return () => {
      socket.off(eventName);
      socket.disconnect();
    };
  }, [item]);

  const currentStatus = order?.status ?? item.status;
  const statusConf = STATUS_CONFIG[currentStatus] ?? { label_hr: currentStatus, label_en: currentStatus, color: '#888', icon: 'info' };
  const statusLabel = isCroatianLang ? statusConf.label_hr : statusConf.label_en;

  const totalAfterCoupon = item.coupon
    ? parseFloat((item.totalPrice - item.coupon).toFixed(2))
    : parseFloat(parseFloat(item.totalPrice).toFixed(2));

  return (
    <View style={styles.card}>

      {/* ── Header red: tip + status ─────────────────────────────── */}
      <View style={styles.headerRow}>
        <View style={styles.deliveryBadge}>
          <MaterialIcons
            name={item.isDelivery ? 'delivery-dining' : 'storefront'}
            size={16}
            color="#fff"
          />
          <Text style={styles.deliveryBadgeText}>
            {isCroatianLang
              ? (item.isDelivery ? 'Dostava' : 'Preuzimanje')
              : (item.isDelivery ? 'Delivery' : 'Pickup')}
          </Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusConf.color + '22', borderColor: statusConf.color }]}>
          <MaterialIcons name={statusConf.icon} size={13} color={statusConf.color} />
          <Text style={[styles.statusBadgeText, { color: statusConf.color }]}>{statusLabel}</Text>
        </View>
      </View>

      {/* ── Info redovi ──────────────────────────────────────────── */}
      <View style={styles.infoSection}>
        <InfoRow icon="person" label={isCroatianLang ? 'Ime' : 'Name'} value={item.name} />
        <InfoRow icon="phone" label={isCroatianLang ? 'Telefon' : 'Phone'} value={item.phone} />
        {item.isDelivery && (
          <InfoRow icon="location-on" label={isCroatianLang ? 'Adresa' : 'Address'} value={`${item.address}, ${item.zone}`} />
        )}
        <InfoRow
          icon="schedule"
          label={isCroatianLang
            ? (item.isDelivery ? 'Okv. dostava' : 'Okv. priprema')
            : (item.isDelivery ? 'Est. delivery' : 'Est. prep')}
          value={formatEuropeanDateTime(item.deadline).split(" ")[1]}
        />
        <View style={styles.infoRow}>
          <MaterialIcons name="payments" size={15} color="#888" style={styles.infoIcon} />
          <Text style={styles.infoLabel}>{isCroatianLang ? 'Cijena' : 'Price'}</Text>
          <View style={styles.priceContainer}>
            {item.coupon ? (
              <>
                <Text style={styles.crossedOut}>{parseFloat(item.totalPrice).toFixed(2)} €</Text>
                <Text style={styles.priceValue}>{totalAfterCoupon.toFixed(2)} €</Text>
              </>
            ) : (
              <Text style={styles.priceValue}>{totalAfterCoupon.toFixed(2)} €</Text>
            )}
          </View>
        </View>
        {item.note?.length > 0 && (
          <InfoRow icon="notes" label={isCroatianLang ? 'Napomena' : 'Note'} value={item.note} />
        )}
      </View>

      {/* ── Cart items ───────────────────────────────────────────── */}
      {item.cartItems?.length > 0 && (
        <>
          <Divider style={styles.divider} />
          <Text style={styles.cartTitle}>
            <MaterialIcons name="receipt-long" size={14} color="#555" />
            {'  '}{isCroatianLang ? 'Naručeno' : 'Items'}
          </Text>
          {item.cartItems.map((cartItem: any, idx: number) => (
            <View key={cartItem.id ?? idx} style={styles.cartItem}>
              <View style={styles.cartItemHeader}>
                <View style={styles.qtyBadge}>
                  <Text style={styles.qtyText}>{cartItem.quantity}×</Text>
                </View>
                <Text style={styles.cartItemName}>
                  {cartItem.name.split("|")[isCroatianLang ? 0 : 1]}
                  {cartItem.size !== 'null' && (
                    <Text style={styles.sizeText}>
                      {' '}({isCroatianLang ? cartItem.size :
                        cartItem.size === "Mala" || cartItem.size === "Mali" ? "Small" :
                        cartItem.size === "Velika" || cartItem.size === "Veliki" ? "Large" :
                        cartItem.size})
                    </Text>
                  )}
                </Text>
              </View>

              {/* Extras */}
              {Object.keys(cartItem.selectedExtras ?? {}).length > 0 && (
                <View style={styles.extrasRow}>
                  <MaterialIcons name="add-circle-outline" size={12} color="#aaa" />
                  <Text style={styles.extrasText}>
                    {Object.entries(cartItem.selectedExtras).map(([extra], i, arr) => (
                      extra.split('|')[isCroatianLang ? 0 : 1] + (i < arr.length - 1 ? ', ' : '')
                    )).join('')}
                  </Text>
                </View>
              )}

              {/* Drinks */}
              {Object.keys(cartItem.selectedDrinks ?? {}).length > 0 && (
                <View style={styles.extrasRow}>
                  <MaterialIcons name="local-drink" size={12} color="#aaa" />
                  <Text style={styles.extrasText}>
                    {Object.values(cartItem.selectedDrinks).map((v: any, i, arr) => (
                      (isCroatianLang ? v.ime : v.ime_en) + (i < arr.length - 1 ? ', ' : '')
                    )).join('')}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </>
      )}

      {/* ── Gumbi ────────────────────────────────────────────────── */}
      <View style={styles.buttonRow}>
        {/* <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          style={styles.deleteBtn}
          activeOpacity={0.7}
        >
          <MaterialIcons name="delete-outline" size={20} color="#E74C3C" />
        </TouchableOpacity> */}

        <TouchableOpacity
          onPress={() => handleRenew(item.id)}
          style={[styles.renewBtn, isDisabled && styles.renewBtnDisabled]}
          disabled={isDisabled}
          activeOpacity={0.8}
        >
          <MaterialIcons name="replay" size={18} color={isDisabled ? '#aaa' : '#fff'} />
          <Text style={[styles.renewText, isDisabled && styles.renewTextDisabled]}>
            {isCroatianLang ? 'Ponovi narudžbu' : 'Reorder'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ── Mali helper komponent ──────────────────────────────────────────────────
const InfoRow = ({ icon, label, value }: { icon: any; label: string; value: string }) => (
  <View style={styles.infoRow}>
    <MaterialIcons name={icon} size={15} color="#888" style={styles.infoIcon} />
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  deliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#2C3E50',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  deliveryBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Lexend_700Bold',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 11,
    fontFamily: 'Lexend_700Bold',
  },

  // Info
  infoSection: {
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoIcon: {
    width: 20,
  },
  infoLabel: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 13,
    color: '#555',
    width: 90,
  },
  infoValue: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    color: '#222',
    flex: 1,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  crossedOut: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    textDecorationLine: 'line-through',
    color: '#aaa',
  },
  priceValue: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 14,
    color: '#222',
  },

  // Cart items
  divider: {
    marginVertical: 12,
    backgroundColor: '#eee',
  },
  cartTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 13,
    color: '#555',
    marginBottom: 8,
  },
  cartItem: {
    marginBottom: 10,
    borderLeftWidth: 2,
    borderLeftColor: '#ffd400',
    paddingLeft: 10,
  },
  cartItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyBadge: {
    backgroundColor: '#ffd400',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 28,
    alignItems: 'center',
  },
  qtyText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 12,
    color: '#fff',
  },
  cartItemName: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 13,
    color: '#222',
    flex: 1,
  },
  sizeText: {
    fontFamily: 'Lexend_400Regular',
    color: '#777',
  },
  extrasRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
    paddingLeft: 4,
  },
  extrasText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: '#888',
    flex: 1,
  },

  // Buttons
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  deleteBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E74C3C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  renewBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    backgroundColor: '#ffd400',
    borderRadius: 8,
  },
  renewBtnDisabled: {
    backgroundColor: '#eee',
  },
  renewText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 15,
    color: '#fff',
  },
  renewTextDisabled: {
    color: '#aaa',
  },
});
