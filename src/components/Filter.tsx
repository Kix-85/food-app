import { View, Text } from 'react-native'
import React, { useState } from 'react'
import { Category } from '@/type'
import { useLocalSearchParams } from 'expo-router'

const Filter = ({ categories }: { categories: Category[] }) => {
    const searchParams = useLocalSearchParams();
    const [active, setActive] = useState(searchParams.category || '');

    const handlePress = (id: string) => {};

    const filterData

    return (
        <View>
            <Text>Filter</Text>
        </View>
    )
}

export default Filter