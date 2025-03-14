import {
    Image,
    StyleSheet,
    Button,
    TextInput,
    View,
    Text,
    Platform,
} from "react-native";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import {
    generateCircomProof,
    generateCircomProofWeb,
    Result,
} from "@/modules/mopro";
import * as FileSystem from "expo-file-system";
import { useState } from "react";
import { Asset } from "expo-asset";

export default function HomeScreen() {
    const [a, setA] = useState("");
    const [b, setB] = useState("");
    const [inputs, setInputs] = useState<string>("");
    const [proof, setProof] = useState<string>("");
    async function genProof(): Promise<void> {
        const circuitInputs = {
            a: [a],
            b: [b],
        };
        if (Platform.OS === "web") {
            const wasmPath = "https://ci-keys.zkmopro.org/multiplier2.wasm";
            const zkeyPath = "https://ci-keys.zkmopro.org/multiplier2_final.zkey";
            const res: Result = await generateCircomProofWeb(
                wasmPath,
                zkeyPath,
                circuitInputs
            );
            setProof(JSON.stringify(res.proof));
            setInputs(JSON.stringify(res.inputs));
        } else if (Platform.OS === "android" || Platform.OS === "ios") {
            const newFileName = "multiplier2_final.zkey";
            const asset = Asset.fromModule(
                require(`@/assets/keys/${newFileName}`)
            );
            const newFilePath = `${FileSystem.documentDirectory}${newFileName}`;
            const fileInfo = await FileSystem.getInfoAsync(newFilePath);
            if (!fileInfo.exists) {
                const file = await asset.downloadAsync();
                if (file.localUri === null) {
                    throw new Error("Failed to download the file");
                }
                try {
                    await FileSystem.moveAsync({
                        from: file.localUri,
                        to: newFilePath,
                    });
                } catch (error) {
                    console.error("Error renaming the file:", error);
                }
            }

            const res: Result = generateCircomProof(
                newFilePath.replace("file://", ""),
                JSON.stringify(circuitInputs)
            );
            console.log(res);
            setProof(JSON.stringify(res.proof));
            setInputs(JSON.stringify(res.inputs));
        }
    }
    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
            headerImage={
                <Image
                    source={require("@/assets/images/partial-react-logo.png")}
                    style={styles.reactLogo}
                />
            }
        >
            <View style={styles.inputContainer}>
                <Text style={styles.label}>a</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter value for a"
                    value={a}
                    onChangeText={setA}
                    keyboardType="numeric"
                />
            </View>
            <View style={styles.inputContainer}>
                <Text style={styles.label}>b</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter value for b"
                    value={b}
                    onChangeText={setB}
                    keyboardType="numeric"
                />
            </View>
            <Button title="Proof" onPress={() => genProof()} />
            <ThemedView style={styles.stepContainer}>
                <ThemedText type="subtitle">Public Signals:</ThemedText>
                <Text style={styles.output}>{inputs}</Text>
                <ThemedText type="subtitle">Proof:</ThemedText>
                <Text style={styles.output}>{proof}</Text>
            </ThemedView>
        </ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
    stepContainer: {
        gap: 8,
        marginBottom: 8,
    },
    input: {
        height: 40,
        borderColor: "gray",
        borderWidth: 1,
        flex: 1,
        paddingHorizontal: 10,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    label: {
        fontSize: 16,
        marginRight: 10,
    },
    reactLogo: {
        height: 178,
        width: 290,
        bottom: 0,
        left: 0,
        position: "absolute",
    },
    output: {
        fontSize: 16,
        borderColor: "gray",
        borderWidth: 1,
        padding: 10,
    },
});
