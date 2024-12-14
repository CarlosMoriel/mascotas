import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps'; // Se incluye Circle
import { GlobalContext } from './GlobalContext';

const MapScreen = () => {
    // context
    const { petList } = useContext(GlobalContext);

    const [foundPets, setFoundPets] = useState(petList.filter((item) => item.isLocated));

    useEffect(() => {
        setFoundPets(petList.filter((item) => item.isLocated));
    }, [petList]);

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: 28.192771,
                    longitude: -105.471392,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
            >
                {foundPets.length !== 0 && foundPets.map((pet, index) => (
                    <React.Fragment key={index}>
                        {/* Círculo para mostrar el área de 30 metros */}
                        <Circle
                            center={{
                                latitude: pet.lat,
                                longitude: pet.lon,
                            }}
                            radius={50} // Radio de 30 metros
                            fillColor="rgba(0, 122, 255, 0.3)" // Azul transparente
                            strokeColor="rgba(0, 122, 255, 0.5)" // Azul con más opacidad en el borde
                        />
                        {/* Marker en el centro del círculo */}
                        <Marker
                            coordinate={{
                                latitude: pet.lat,
                                longitude: pet.lon,
                            }}
                            title={pet.name}
                            description="Última ubicación detectada"
                        />
                    </React.Fragment>
                ))}
            </MapView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
});

export default MapScreen;
