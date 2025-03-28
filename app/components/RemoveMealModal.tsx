import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';

interface RemoveMealModalProps {
  isVisible: boolean;
  onClose: () => void;
  onRemove: () => void;
}

const RemoveMealModal = ({ isVisible, onClose, onRemove }: RemoveMealModalProps) => {
  return (
    <Modal visible={isVisible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Remove meal?</Text>
          <Text style={styles.modalText}>Are you sure you want to remove this meal from your cart?</Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalCancelButton} onPress={onClose}>
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalRemoveButton} onPress={onRemove}>
              <Text style={styles.modalRemoveButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: 300,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  modalCancelButtonText: {
    fontSize: 16,
    color: '#333',
  },
  modalRemoveButton: {
    backgroundColor: '#ffcc00',
    padding: 10,
    borderRadius: 10,
  },
  modalRemoveButtonText: {
    fontSize: 16,
    color: '#fff',
  },
});

export default RemoveMealModal;
