import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';

const PetDetailsScreen = ({ route, navigation }) => {
    const { name, photo, isLost, id } = route.params; // Obtener los datos pasados desde la lista

    const handleReportLost = async () => {
        try {
            // Obtener el documento actual de Firebase
            const petDoc = firestore().collection('pets').doc(id);
            const petData = await petDoc.get();

            if (!petData.exists) {
                Alert.alert('Error', 'No se encontró el registro de esta mascota.');
                return;
            }

            // Obtener el estado actual de isLost y cambiarlo
            const currentIsLost = petData.data().isLost;
            const newIsLost = !currentIsLost;

            // Actualizar el campo isLost en Firebase
            await petDoc.update({ isLost: newIsLost });

            // Mostrar alerta con el mensaje adecuado
            if (newIsLost) {
                Alert.alert('Mascota perdida', `Has reportado que ${name} está perdido.`);
            } else {
                Alert.alert('Mascota encontrada', `Has reportado que ${name} ya no está perdido.`);
                await petDoc.update({ isLocated: false });
            }
        } catch (error) {
            // Manejo de errores
            Alert.alert('Error', 'No se pudo actualizar el estado de la mascota.');
            console.error('Error al actualizar el campo isLost en Firebase:', error);
        }
        navigation.goBack();
    };

    const handleDeletePet = async () => {
        Alert.alert(
            'Eliminar mascota',
            `¿Estás seguro de que deseas eliminar a ${name}? Esta acción no se puede deshacer.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Eliminar el registro de Firebase
                            await firestore().collection('pets').doc(id).delete();

                            // Mostrar alerta de éxito
                            Alert.alert('Éxito', `La mascota ${name} ha sido eliminada.`);

                            // Navegar de regreso a la lista de mascotas
                            navigation.goBack();
                        } catch (error) {
                            // Manejo de errores
                            Alert.alert('Error', 'No se pudo eliminar la mascota.');
                            console.error('Error al eliminar en Firebase:', error);
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Image source={{ uri: photo }} style={styles.photo} />
            <Text style={styles.petName}>{name}</Text>

            <TouchableOpacity style={isLost ? styles.foundButton : styles.reportButton} onPress={handleReportLost}>
                <Text style={styles.reportButtonText}>{isLost ? 'Reportar como Encontrado' : 'Reportar como perdido'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePet}>
                <Text style={styles.deleteButtonText}>Eliminar Mascota</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    photo: {
        width: '100%',
        height: 300,
        borderRadius: 8,
        marginBottom: 16,
    },
    petName: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
    },
    reportButton: {
        backgroundColor: '#d9534f',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 16,
    },
    foundButton: {
        backgroundColor: 'green',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 16,
    },
    reportButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    deleteButton: {
        backgroundColor: '#000',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default PetDetailsScreen;
