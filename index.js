import React, { useState, useEffect } from 'react';
import { Animated, View, StyleSheet, PanResponder } from 'react-native';

const CustomSlider = (props) => {
    const [pan] = useState(new Animated.Value(0));
    const [sliderValue, setSliderValue] = useState(props.value || props.minimumValue || 0);
    const [trackWidth, setTrackWidth] = useState(280);
    const [isDragging, setIsDragging] = useState(false);
    const minValue = props.minimumValue || 1;
    const maxValue = props.maximumValue || 100;
    const snapToInterval = props.step || 1;
    const pointerWidth = 20;
    const dragThreshold = 2;

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => !props.disabled,
        onPanResponderGrant: () => {
            setIsDragging(false);

        },
        onPanResponderMove: (evt, gestureState) => {
            if (!isDragging && Math.abs(gestureState.dx) > dragThreshold) {
                setIsDragging(true);

            }
            if (isDragging) {
                let newX = gestureState.dx + (sliderValue - minValue) / (maxValue - minValue) * (trackWidth - pointerWidth);
                // Ensure newX is within bounds
                if (newX < 0) newX = 0;
                if (newX > trackWidth - pointerWidth) newX = trackWidth - pointerWidth;
                let newValue = Math.round((newX / (trackWidth - pointerWidth)) * (maxValue - minValue)) + minValue;
                newValue = Math.round(newValue / snapToInterval) * snapToInterval;
                if (newValue < minValue) newValue = minValue;
                if (newValue > maxValue) newValue = maxValue;
                newX = ((newValue - minValue) / (maxValue - minValue)) * (trackWidth - pointerWidth);
                pan.setValue(newX);
                setSliderValue(newValue);
                if (props.onValueChange) props.onValueChange(newValue);

            }
        },
        onPanResponderRelease: () => {
            pan.flattenOffset();

        },
    });

    useEffect(() => {
        const newPanValue = ((sliderValue - minValue) / (maxValue - minValue)) * (trackWidth - pointerWidth);
        Animated.timing(pan, {
            toValue: newPanValue,
            duration: 200,
            useNativeDriver: false,

        }).start();
    }, [sliderValue, minValue, maxValue, trackWidth]);

    useEffect(() => {
        if (props.value !== undefined) {
            setSliderValue(props.value);

        }
    }, [props.value]);

    return (
        <View
            style={[styles.container, props.style]}
            onLayout={(event) => {
                const { width } = event.nativeEvent.layout;
                setTrackWidth(width); // Capture the track width
            }}
        >
            <View style={[styles.track, { width: trackWidth }, props.trackStyle]}>
                <View
                    style={[
                        styles.trackLeft,
                        { width: ((sliderValue - minValue) / (maxValue - minValue)) * trackWidth },
                        props.minimumTrackTintColor && { backgroundColor: props.minimumTrackTintColor },

                    ]}
                />
                <View
                    style={[
                        styles.trackRight,
                        { width: trackWidth - ((sliderValue - minValue) / (maxValue - minValue)) * trackWidth },
                        props.maximumTrackTintColor && { backgroundColor: props.maximumTrackTintColor },

                    ]}
                />
                <Animated.View
                    style={[
                        styles.pointer,
                        props.thumbStyle,
                        {
                            transform: [{ translateX: pan }],
                        },
                    ]}
                    {...(props.disabled ? {} : panResponder.panHandlers)}
                />
                <Animated.View
                    style={[
                        styles.valueIndicator,
                        ...(props.thumbProps ? [{ top: -5 }] : [{ top: -30 }]),
                        {
                            transform: [{ translateX: pan }],
                        },
                    ]}
                >
                    {props.thumbProps && props.thumbProps.children}
                </Animated.View>
            </View>
            {props.disabled && <View style={styles.disabledOverlay} />}
        </View>
    );
};

export default CustomSlider;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: 40,

    },
    titleText: {
        fontSize: 14,
        lineHeight: 24,
        fontWeight: 'bold',
        marginBottom: 20,

    },
    valueText: {
        fontSize: 16,
        marginBottom: 20,

    },
    track: {
        height: 10,
        backgroundColor: '#ddd',
        borderRadius: 5,
        position: 'relative',
        overflow: 'visible',

    },
    valueIndicator: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 5,
        marginTop: -25

    },
    pointer: {
        width: 30,
        height: 30,
        backgroundColor: 'blue',
        borderRadius: 30,
        position: 'absolute',
        top: -10,
        marginLeft: -1,
        zIndex: 1,

    },
    trackLeft: {
        height: '100%',
        position: 'absolute',
        left: 0,
        backgroundColor: 'blue',
        borderTopLeftRadius: 5,
        borderBottomLeftRadius: 5,

    },
    trackRight: {
        height: '100%',
        position: 'absolute',
        right: 0,
        backgroundColor: '#eee',
        borderRadius: 5,

    },
    disabledOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.6)', // semi-transparent overlay to indicate disabled state

    },
});