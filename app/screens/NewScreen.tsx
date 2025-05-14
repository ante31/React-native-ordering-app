import React, { useState } from 'react'
import { Button } from 'react-native'

export default function NewScreen ({ navigation }: { navigation: any }) {
  return (
    <Button
      title="Go to Home"
      onPress={() => navigation.navigate('Home')}
    />
  )
}