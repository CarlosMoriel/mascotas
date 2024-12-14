import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import PetsListScreen from './Pets';
import MapScreen from './MapScreen';
import AddPetScreen from './AddPetScreen';
import PetDetailsScreen from './PetDetailsScreen';
import GlobalContextProvider from './GlobalContext';
import { Image } from 'react-native';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const PetsStack = () => (
    <Stack.Navigator>
        <Stack.Screen
            name="Mascotas"
            component={PetsListScreen}
            options={{ headerShown: false }}
        />
        <Stack.Screen name="Añadir Mascota" component={AddPetScreen} />
        <Stack.Screen name="Detalles de la Mascota" component={PetDetailsScreen} />
    </Stack.Navigator>
);

export default function App() {
    return (
        <GlobalContextProvider>
            <NavigationContainer>
                <Tab.Navigator
                    screenOptions={({ route }) => ({
                        tabBarIcon: ({ focused }) => {
                            // Determina el ícono según la ruta
                            let iconSource;

                            if (route.name === 'Ver Mascotas') {
                                iconSource = focused
                                    ? require('./assets/icons/pets.png') // Ícono activo
                                    : require('./assets/icons/pets.png'); // Ícono inactivo
                            } else if (route.name === 'Mapa') {
                                iconSource = focused
                                    ? require('./assets/icons/map.png') // Ícono activo
                                    : require('./assets/icons/map.png'); // Ícono inactivo
                            }

                            // Devuelve el componente de imagen
                            return <Image source={iconSource} style={{ width: 24, height: 24 }} />;
                        },
                    })}
                >
                    <Tab.Screen
                        name="Ver Mascotas"
                        options={{ headerShown: false }}
                        component={PetsStack}
                    />
                    <Tab.Screen
                        name="Mapa"
                        component={MapScreen}
                    />
                </Tab.Navigator>
            </NavigationContainer>
        </GlobalContextProvider>

    );
}
