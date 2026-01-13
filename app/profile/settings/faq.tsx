import { useRouter } from "expo-router";
import { HelpCircle, X } from "lucide-react-native";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const COLORS = {
  green: "#5DBD76",
  gray: "#F5F7F8",
  text: "#1A1A1A",
  muted: "#666",
};

type FAQItem = {
  question: string;
  answer: string;
};

const FAQS: FAQItem[] = [
  {
    question: "Como ganho Badges?",
    answer:
      "Os Badges são ganhos ao completar rotas, atingir objetivos e manter uma utilização regular da aplicação.",
  },
  {
    question: "O que são Eco Points?",
    answer:
      "Os Eco Points medem o teu impacto positivo, tendo em conta a distância percorrida e a frequência das viagens.",
  },
  {
    question: "Para que servem os Eco Points?",
    answer:
      "Os Eco Points contribuem para o teu nível na aplicação e ajudam a desbloquear novos Badges.",
  },
  {
    question: "O que é o Pedal Level?",
    answer:
      "O Pedal Level representa o teu progresso global na aplicação, baseado nos Eco Points acumulados.",
  },
  {
    question: "Posso editar o meu perfil?",
    answer:
      "Sim. Podes editar o teu perfil a qualquer momento através da opção 'Editar Perfil'.",
  },
  {
    question: "Como altero as unidades de distância?",
    answer:
      "Podes alterar as unidades entre quilómetros e milhas nas definições da aplicação.",
  },
  {
    question: "Posso mudar o idioma da aplicação?",
    answer:
      "Sim. A aplicação permite selecionar diferentes idiomas nas definições.",
  },
  {
    question: "Recebo notificações automaticamente?",
    answer:
      "As notificações podem ser ativadas ou desativadas manualmente nas definições.",
  },
  {
    question: "Os meus dados estão seguros?",
    answer:
      "Sim. A aplicação segue boas práticas de segurança para proteger os dados dos utilizadores.",
  },
  {
    question: "A aplicação funciona sem internet?",
    answer:
      "Algumas funcionalidades básicas funcionam offline, mas é necessária ligação à internet para sincronizar dados.",
  },
  {
    question: "Posso apagar a minha conta?",
    answer:
      "Sim. A opção para apagar a conta está disponível nas definições da conta.",
  },
];

export default function FAQScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.green }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <HelpCircle size={20} color="white" />
          <Text style={styles.headerTitle}>Perguntas Frequentes</Text>
        </View>

        <TouchableOpacity onPress={() => router.back()}>
          <X size={22} color="white" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <ScrollView contentContainerStyle={{ padding: 24 }}>
          {FAQS.map((item, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.question}>{item.question}</Text>
              <Text style={styles.answer}>{item.answer}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.gray,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  card: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 20,
    marginBottom: 16,
    elevation: 2,
  },
  question: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  answer: {
    fontSize: 14,
    color: COLORS.muted,
    lineHeight: 20,
  },
});
