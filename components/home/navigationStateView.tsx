import { ArrowLeft, Navigation, Search } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface NavigationStep {
  instruction: string;
  maneuver: string;
  distanceMeters: number;
}

interface NavigatingStateProps {
  onBack: () => void;
  distanceMeters?: number;
  duration?: string;
  currentStep?: { step: NavigationStep; index: number; distanceToEnd: number } | null;
  onRouteComplete?: () => void;
}

// export default function NavigatingState({
//   onBack,
//   distanceMeters,
//   duration,
//   currentStep,
//   onRouteComplete,
// }: NavigatingStateProps) {
//   const durationInMinutes = duration ? Math.ceil(parseInt(duration) / 60) : null;
//   const durationStr = durationInMinutes ? durationInMinutes.toString() : 'N/A';
//   const distanceInKm = distanceMeters ? (distanceMeters / 1000).toFixed(1) : null;
//   const arrivalTime = durationInMinutes ? new Date(Date.now() + durationInMinutes * 60000) : null;
//   const arrivalHours = arrivalTime ? arrivalTime.getHours() : null;
//   const arrivalMinutes = arrivalTime
//     ? arrivalTime.getMinutes().toString().padStart(2, '0')
//     : null;
//   const arrivalTimeStr = arrivalTime ? `${arrivalHours}:${arrivalMinutes}` : 'N/A';

//   const stepDistanceStr = currentStep
//     ? currentStep.distanceToEnd > 1000
//       ? `${(currentStep.distanceToEnd / 1000).toFixed(1)} km`
//       : `${Math.round(currentStep.distanceToEnd)} m`
//     : 'N/A';

//   const hasTriggered = useRef(false);

//   const getRotationForManeuver = (maneuver: string): number => {
//     const maneuverLower = maneuver.toLowerCase();
    
//     // English maneuvers
//     if (maneuverLower.includes('DEPART') || maneuverLower.includes('CONTINUE')) return 0;
//     if (maneuverLower.includes('TURN-SLIGHT-RIGHT')) return 30;
//     if (maneuverLower.includes('TURN-RIGHT') && !maneuverLower.includes('SLIGHT') && !maneuverLower.includes('SHARP')) return 90;
//     if (maneuverLower.includes('TURN-SHARP-RIGHT')) return 135;
//     if (maneuverLower.includes('TURN-SLIGHT-LEFT')) return -30;
//     if (maneuverLower.includes('TURN-LEFT') && !maneuverLower.includes('SLIGHT') && !maneuverLower.includes('SHARP')) return -90;
//     if (maneuverLower.includes('TURN-SHARP-LEFT')) return -135;
//     if (maneuverLower.includes('UTURN')) return 180;
    
//     // Portuguese maneuvers
//     if (maneuverLower.includes('EM FRENTE') || maneuverLower.includes('CONTINUAR')) return 0;
//     if (maneuverLower.includes('LIGEIRAMENTE À DIREITA')) return 30;
//     if ((maneuverLower.includes('VIRAR') && maneuverLower.includes('DIREITA')) && !maneuverLower.includes('LIGEIRAMENTE') && !maneuverLower.includes('ACENTUADAMENTE')) return 90;
//     if (maneuverLower.includes('ACENTUADAMENTE À DIREITA')) return 135;
//     if (maneuverLower.includes('LIGEIRAMENTE À ESQUERDA')) return -30;
//     if ((maneuverLower.includes('VIRAR') && maneuverLower.includes('ESQUERDA')) && !maneuverLower.includes('LIGEIRAMENTE') && !maneuverLower.includes('ACENTUADAMENTE')) return -90;
//     if (maneuverLower.includes('ACENTUADAMENTE À ESQUERDA')) return -135;
//     if (maneuverLower.includes('MEIA VOLTA') || maneuverLower.includes('U-TURN')) return 180;
    
//     // Portuguese compass directions
//     if (maneuverLower.includes('NORTE')) return 0;
//     if (maneuverLower.includes('NORDESTE')) return 45;
//     if (maneuverLower.includes('ESTE')) return 90;
//     if (maneuverLower.includes('SUDESTE')) return 135;
//     if (maneuverLower.includes('SUL')) return 180;
//     if (maneuverLower.includes('SUDOESTE')) return -135;
//     if (maneuverLower.includes('OESTE')) return -90;
//     if (maneuverLower.includes('NOROESTE')) return -45;
    
//     return 0; // default straight
//   };

//   const iconRotation = currentStep ? getRotationForManeuver(currentStep.step.maneuver) : 0;
//   console.log('Maneuver:', currentStep?.step.maneuver, 'Rotation:', iconRotation);
//   useEffect(() => {
//     // Check if user arrived at destination
//     if (distanceMeters !== undefined && distanceMeters < 50 && !hasTriggered.current && onRouteComplete) {
//       hasTriggered.current = true;
//       onRouteComplete();
//     }
//   }, [distanceMeters]);

export default function NavigatingState({
  onBack,
  distanceMeters,
  duration,
  currentStep,
  onRouteComplete,
}: NavigatingStateProps) {
  const hasTriggered = useRef(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Calculations
  const durationInMinutes = duration ? Math.ceil(parseInt(duration) / 60) : null;
  const distanceInKm = distanceMeters ? (distanceMeters / 1000).toFixed(1) : null;
  const arrivalTime = durationInMinutes ? new Date(Date.now() + durationInMinutes * 60000) : null;
  const arrivalTimeStr = arrivalTime
    ? `${arrivalTime.getHours()}:${arrivalTime.getMinutes().toString().padStart(2, '0')}`
    : '--:--';

  const stepDistanceStr = currentStep
    ? currentStep.distanceToEnd > 1000
      ? `${(currentStep.distanceToEnd / 1000).toFixed(1)} km`
      : `${Math.round(currentStep.distanceToEnd)} m`
    : 'Calculating...';

  // Pulse animation for turn indicator when close
  useEffect(() => {
    if (currentStep && currentStep.distanceToEnd < 100) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [currentStep]);

  // Get maneuver icon rotation with simplified logic
  const getManeuverRotation = (maneuver: string): number => {
    const m = maneuver.toUpperCase();
    
    // Straight/Continue
    if (m.includes('DEPART') || m.includes('CONTINUE') || m.includes('STRAIGHT')) return 0;
    
    // Right turns
    if (m.includes('SLIGHT') && m.includes('RIGHT')) return 30;
    if (m.includes('SHARP') && m.includes('RIGHT')) return 120;
    if (m.includes('RIGHT')) return 90;
    
    // Left turns
    if (m.includes('SLIGHT') && m.includes('LEFT')) return -30;
    if (m.includes('SHARP') && m.includes('LEFT')) return -120;
    if (m.includes('LEFT')) return -90;
    
    // U-turn
    if (m.includes('UTURN') || m.includes('U-TURN')) return 180;
    
    return 0;
  };

  const iconRotation = currentStep ? getManeuverRotation(currentStep.step.maneuver) : 0;

  // Route completion check
  useEffect(() => {
    if (distanceMeters !== undefined && distanceMeters < 50 && !hasTriggered.current && onRouteComplete) {
      hasTriggered.current = true;
      onRouteComplete();
    }
  }, [distanceMeters, onRouteComplete]);

  return (
    <>
      <TouchableOpacity
        onPress={onBack}
        style={{
          position: 'absolute',
          top: 60,
          left: 16,
          zIndex: 20,
          backgroundColor: 'white',
          padding: 12,
          borderRadius: 50,
        }}
      >
        <ArrowLeft size={24} color="#333" />
      </TouchableOpacity>

      {/* Turn instruction banner - text only */}
      {currentStep && (
        <View
          style={{
            position: 'absolute',
            top: 60,
            left: 0,
            right: 0,
            marginHorizontal: 80,
            zIndex: 15,
            backgroundColor: 'white',
            padding: 16,
            borderRadius: 16,
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111', textAlign: 'center' }}>
            {currentStep.step.instruction}
          </Text>
        </View>
      )}

      <View
        style={[
          styles.bottomSheet,
          {
            padding: 24,
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
          },
        ]}
      >
        {/* Turn instruction icon and distance */}
        {currentStep ? (
          <View style={{ alignItems: 'center' }}>
            <Animated.View style={{ transform: [{ rotate: `${iconRotation}deg` }] }}>
              <Navigation size={28} color="#FF9331" />
            </Animated.View>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#666' }}>
              {stepDistanceStr}
            </Text>
          </View>
        ) : (
          <View style={{ alignItems: 'center' }}>
            <View
              style={{ backgroundColor: '#E5E7EB', padding: 12, borderRadius: 16, marginBottom: 4, width: 52, height: 52, justifyContent: 'center', alignItems: 'center' }}
            >
              <View style={{ width: 28, height: 28, backgroundColor: '#D1D5DB', borderRadius: 4 }} />
            </View>
            <View style={{ width: 50, height: 12, backgroundColor: '#E5E7EB', borderRadius: 4 }} />
          </View>
        )}

        <View style={{ alignItems: 'center' }}>
          <View style={{ marginBottom: 4, justifyContent: 'center' }}>
            <Text style={{ color: '#9ca3af', fontWeight: 'bold', fontSize: 12 }}>Est. Arrival</Text>
            <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{arrivalTimeStr}</Text>
          </View>
          <Text style={{ color: '#9ca3af', fontWeight: 'bold', fontSize: 12 }}>
            {durationInMinutes} MIN • {distanceInKm} KM
          </Text>
        </View>

        <View style={{ alignItems: 'center' }}>
          <Search size={28} color="#9ca3af" />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    elevation: 20,
  },
});
