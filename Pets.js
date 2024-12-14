import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { GlobalContext } from './GlobalContext';

const PetsListScreen = ({ navigation }) => {
    // Context
    const globalContext = useContext(GlobalContext);

    const handleAddPet = () => {
        navigation.navigate('Añadir Mascota');
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.petCard}
            onPress={() =>
                navigation.navigate('Detalles de la Mascota', {
                    name: item.name,
                    photo: item.photo,
                    isLost: item.isLost,
                    id: item.id,
                })
            }
        >
            <View style={styles.cardContent}>
                <View
                    style={[
                        styles.statusIndicator,
                        { backgroundColor: item.isLost ? '#d9534f' : '#5cb85c' }, // Rojo para perdido, verde para encontrado
                    ]}
                />
                <View style={styles.textContent}>
                    <Text style={styles.petName}>{item.name}</Text>
                    <Text style={styles.petStatus}>
                        {item.isLost ? 'Perdido' : 'Encontrado'}
                    </Text>
                </View>
            </View>
            <Image source={{ uri: item.photo }} style={styles.photoPreview} />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={globalContext.petList}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                ListEmptyComponent={<View style={styles.nopetcard}><Text style={styles.nopets}>No hay mascotas registradas</Text></View>}
            />
            <TouchableOpacity style={styles.fab} onPress={handleAddPet}>
                <Image source={require('./assets/icons/add.png')} style={{ width: 32, height: 32 }} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        backgroundColor: '#95d9ea',
        borderRadius: 50,
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    petCard: {
        padding: 15,
        marginVertical: 10,
        marginHorizontal: 20,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    statusIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 12,
    },
    textContent: {
        flex: 1,
    },
    petName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#333',
    },
    petStatus: {
        fontSize: 14,
        fontWeight: '600',
        color: '#777',
    },
    photoPreview: {
        width: '100%',
        height: 200,
        borderRadius: 8,
    },
    nopetcard: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 200,
        textAlign: 'center',
    },
    nopets: {
        textAlign: 'center',
    },
});


export default PetsListScreen;
