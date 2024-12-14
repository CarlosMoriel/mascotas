import React, { useContext, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Button,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { GlobalContext } from './GlobalContext';

const AddPetScreen = () => {
    // Context
    const { petList } = useContext(GlobalContext);

    const [petName, setPetName] = useState('');
    const [wifiAddress, setwifiAddress] = useState('');
    const [photo, setPhoto] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Manejar la toma de fotos
    const handleTakePhoto = async () => {
        const options = {
            mediaType: 'photo',
            saveToPhotos: true,
        };

        try {
            const result = await launchCamera(options);
            if (!result.didCancel && result.assets && result.assets.length > 0) {
                setPhoto(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo acceder a la cámara.');
        }
    };

    // Subir la foto a Firebase Storage
    const uploadPhotoToStorage = async () => {
        if (!photo) return null;

        const fileName = `pets/${wifiAddress}_photo.jpg`;
        const reference = storage().ref(fileName);

        try {
            setUploading(true);
            await reference.putFile(photo);
            const downloadURL = await reference.getDownloadURL();
            setUploading(false);
            return downloadURL;
        } catch (error) {
            setUploading(false);
            console.error('Error al subir la foto:', error);
            Alert.alert('Error', 'No se pudo subir la foto.');
            return null;
        }
    };

    // Guardar datos en Firestore
    const handleSavePet = async () => {
        if (!petName || !wifiAddress || !photo) {
            Alert.alert('Error', 'Por favor, completa todos los campos.');
            return;
        }

        if (petList.some(pet => pet.wifiAddress === wifiAddress)) {
            Alert.alert('Error', 'El número de serie del collar ya está registrado.');
            return;
        }

        // Subir la foto al almacenamiento de Firebase
        const photoURL = await uploadPhotoToStorage();

        if (photoURL) {
            try {
                // Guardar datos en Firestore
                await firestore().collection('pets').add({
                    name: petName,
                    wifiAddress,
                    photo: photoURL,
                    isLost: false,
                    lat: '',
                    lon: '',
                    isLocated: false,
                    createdAt: firestore.FieldValue.serverTimestamp(),
                });

                Alert.alert('Éxito', `Mascota ${petName} guardada con éxito.`);
                // Reiniciar el formulario
                setPetName('');
                setwifiAddress('');
                setPhoto(null);
            } catch (error) {
                console.error('Error al guardar en Firestore:', error);
                Alert.alert('Error', 'No se pudo guardar la mascota.');
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Nombre de la Mascota</Text>
            <TextInput
                style={styles.input}
                placeholder="Ingresa el nombre de tu mascota"
                value={petName}
                onChangeText={setPetName}
            />

            <Text style={styles.label}>Número de Serie del Collar</Text>
            <TextInput
                style={styles.input}
                placeholder="Ingresa el número de serie del collar"
                value={wifiAddress}
                onChangeText={setwifiAddress}
            />

            <TouchableOpacity style={styles.photoButton} onPress={handleTakePhoto}>
                <Text style={styles.photoButtonText}>Tomar Foto</Text>
            </TouchableOpacity>

            {photo && <Image source={{ uri: photo }} style={styles.photoPreview} />}

            <Button
                title={uploading ? 'Guardando...' : 'Guardar Mascota'}
                onPress={handleSavePet}
                disabled={uploading}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    label: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 16,
    },
    photoButton: {
        backgroundColor: '#6200ee',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 16,
    },
    photoButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    photoPreview: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 16,
    },
});

export default AddPetScreen;
