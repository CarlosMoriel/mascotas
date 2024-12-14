import React, { useEffect, useState, createContext } from 'react';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import WifiManager from 'react-native-wifi-reborn';
import Geolocation from '@react-native-community/geolocation';
import { Linking } from 'react-native';

export const GlobalContext = createContext();


const GlobalContextProvider = ({ children }) => {
    const [petList, setPetList] = useState([]);
    const [isPermissions, setIsPermissions] = useState(false);

    useEffect(() => {
        // Configurar el listener en tiempo real
        const unsubscribe = firestore()
            .collection('pets')
            .onSnapshot(snapshot => {
                const pets = snapshot.docs.map(doc => ({
                    id: doc.id, // ID del documento
                    ...doc.data(), // Datos del documento
                }));
                setPetList(pets); // Actualizar el estado con los datos nuevos
                if (pets.length > 0 && pets[0].wifiAddress === "MascotaTracker" && pets[0].isLost && !pets[0].isLocated) {
                    setInterval(() => {
                        console.log("Comprobando redes wifi");
                        checkWifiNetworks();
                    }, 31000);
                } else {
                    for (let i = 0; i < 9999; i++) {
                        clearInterval(i);
                    }
                }
            }, error => {
                console.error('Error al escuchar cambios en la colección pets:', error);
            });

        if (!isPermissions) {
            setIsPermissions(requestPermissions());
        } else {

        }

        // Limpiar el listener al desmontar el componente
        return () => unsubscribe();
    }, [isPermissions]);


    return (
        <GlobalContext.Provider value={{ petList }}>
            {children}
        </GlobalContext.Provider>);
}


const requestPermissions = async () => {
    try {
        // Solicitar permisos necesarios
        const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
            PermissionsAndroid.PERMISSIONS.NEARBY_WIFI_DEVICES, // Para Android 12 o superior
        ]);

        // Verificar si los permisos fueron otorgados
        const allGranted = Object.values(granted).every(
            permission => permission === PermissionsAndroid.RESULTS.GRANTED
        );

        if (!allGranted) {
            Alert.alert(
                'Permisos necesarios.',
                'Se requieren permisos para acceder a la ubicación, redes wifi y notificaciones'
            );
            return false;
        }

        // Solo solicitar ACCESS_BACKGROUND_LOCATION si ya se concedió ACCESS_FINE_LOCATION
        if (Platform.Version >= 29) { // Desde Android 10
            const backgroundGranted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
            );

            if (backgroundGranted !== PermissionsAndroid.RESULTS.GRANTED) {
                Alert.alert(
                    'Permisos de ubicación en segundo plano',
                    'Se requieren permisos para acceder a la ubicación en segundo plano.'
                );
                return false;
            }
        }

        console.log('Permisos iniciales concedidos');

        return true;
    } catch (error) {
        console.error('Error al solicitar permisos:', error);
        return false;
    }
};

const checkWifiNetworks = async () => {
    try {
        // Forzar escaneo de redes WiFi en Android
        if (Platform.OS !== 'android') {
            return false;
        }

        const networks = await WifiManager.reScanAndLoadWifiList();

        console.log("redes: ", networks);

        const mascotaTrackerNetwork = networks.find(
            network => network.SSID === 'MascotaTracker'
        );


        if (mascotaTrackerNetwork) {
            console.log('Red MascotaTracker encontrada');

            // Obtener ubicación del usuario
            Geolocation.getCurrentPosition(
                async position => {
                    try {
                        const { latitude, longitude } = position.coords;

                        // Buscar el documento en la colección "pets" con wifiAddress igual a "MascotaTracker"
                        const querySnapshot = await firestore()
                            .collection('pets')
                            .where('wifiAddress', '==', 'MascotaTracker')
                            .get();

                        if (!querySnapshot.empty) {
                            // Actualizar el primer documento encontrado
                            const petDoc = querySnapshot.docs[0];
                            await firestore().collection('pets').doc(petDoc.id).update({
                                lat: latitude,
                                lon: longitude,
                                isLocated: true,
                            });
                            if (!petDoc.data().isLocated) {
                                Alert.alert(
                                    'Mascota Encontrada',
                                    'La ubicación de tu mascota ha sido actualizada en el mapa.'
                                );
                                for (let i = 0; i < 9999; i++) {
                                    clearInterval(i);
                                }
                            }

                        }
                    } catch (error) {
                        console.error('Error al actualizar la ubicación en Firebase:', error);
                        Alert.alert('Error', 'No se pudo actualizar la ubicación de la mascota.');
                    }
                },
                error => {
                    console.error('Error al obtener la ubicación:', error);
                    Alert.alert('Error', 'No se pudo obtener la ubicación.');
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
            );
        } else {
            console.log('Red MascotaTracker no encontrada');
        }
    } catch (error) {
        console.error('Error al cargar redes WiFi:', error);
    }
};


export default GlobalContextProvider;
