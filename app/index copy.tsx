import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  SafeAreaView, 
  StyleSheet, 
  Dimensions,
  StatusBar,
  Platform
} from 'react-native';
import { WebView } from 'react-native-webview';
import Svg, { Path, Circle as SvgCircle } from 'react-native-svg';
import { 
  MapPin, Home, Heart, MessageCircle, User, Settings, 
  ArrowRight, ArrowLeft, Search, AlertTriangle, Lock, 
  Edit2, ChevronRight, Bell, Globe, Zap, Smartphone, 
  Layout, Moon, HelpCircle, Check, Mail, Filter, Star, 
  Calendar, Clock, LucideIcon, X, ChevronDown
} from 'lucide-react-native';

// --- TYPES ---

interface Badge {
  id: number;
  name: string;
  icon: string;
  locked: boolean;
}

interface UserData {
  name: string;
  username: string;
  bio: string;
  link: string;
  gender: string;
  birthday: string;
  rides: number;
  followers: number;
  following: number;
  weeklyStats: number[];
  level: number;
  ecoPoints: number;
  badges: Badge[];
}

// --- DADOS MOCKADOS ---

const COLORS = {
  primaryGreen: "#5DBD76", 
  primaryOrange: "#FF9E46", 
  textOrange: "#FF9E46",
  teal: "#35C2C1",
  lightGray: "#F8F9FA",
  darkText: "#1A1A1A",
  white: "#FFFFFF"
};

const USER_DATA: UserData = {
  name: "Georg Knorr",
  username: "georg_rider",
  bio: "Placeholder",
  link: "https://example.com",
  gender: "Masculino",
  birthday: "20 Nov, 1990",
  rides: 270,
  followers: 102,
  following: 178,
  weeklyStats: [11, 21, 15, 28, 18, 8, 35],
  level: 5,
  ecoPoints: 1250,
  badges: [
    { id: 1, name: "Marathon Rider", icon: "🥇", locked: false },
    { id: 2, name: "Green Legend", icon: "🌱", locked: false },
    { id: 3, name: "Weekly Goal", icon: "🛡️", locked: true },
    { id: 4, name: "Month Goal", icon: "📅", locked: true },
    { id: 5, name: "Burn 300 Calories", icon: "🔥", locked: true },
  ]
};

// --- COMPONENTES UI ---

const Button = ({ 
  children, 
  onClick, 
  variant = "primary", 
  style = {} 
}: { 
  children: React.ReactNode, 
  onClick?: () => void, 
  variant?: "primary" | "outline", 
  style?: object 
}) => {
  const isPrimary = variant === "primary";
  return (
    <TouchableOpacity 
      onPress={onClick} 
      style={[
        styles.buttonBase, 
        isPrimary ? { backgroundColor: COLORS.primaryOrange } : { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#ddd' },
        style
      ]}
    >
      <Text style={{ color: isPrimary ? 'white' : '#666', fontWeight: 'bold', fontSize: 16 }}>{children}</Text>
    </TouchableOpacity>
  );
};

const InputField = ({ label, value, placeholder, icon: Icon, isPassword }: any) => (
  <View style={{ marginBottom: 16 }}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputContainer}>
      <TextInput 
        style={styles.input} 
        value={value} 
        placeholder={placeholder}
        secureTextEntry={isPassword}
        placeholderTextColor="#9ca3af"
      />
      {Icon && <Icon size={20} color="#9ca3af" style={{ marginRight: 12 }} />}
    </View>
  </View>
);

const InteractiveMap = () => {
  // Mapa centrado no Porto/Gaia para exemplo
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
        <style>body { margin: 0; padding: 0; } #map { width: 100%; height: 100vh; }</style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map', {zoomControl: false}).setView([41.1579, -8.6291], 13);
          L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '©OpenStreetMap, ©CartoDB'
          }).addTo(map);
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.mapContainer}>
      <WebView 
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={{ flex: 1 }}
        scrollEnabled={false}
      />
      {/* Overlay para interações ou estilo */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(30,58,138,0.05)', pointerEvents: 'none' }]} />
    </View>
  );
};

// --- SUB-VIEWS DO PROFILE ---

const EditProfileView = ({ onBack }: { onBack: () => void }) => (
  <View style={styles.fullScreenContainer}>
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Editar Perfil</Text>
      <TouchableOpacity onPress={onBack}><X color="white" size={24} /></TouchableOpacity>
    </View>
    <View style={styles.contentContainer}>
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <View style={styles.avatarLargeContainer}>
            <Image source={{ uri: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200" }} style={styles.avatarLarge} />
            <View style={styles.editIconBadge}><Edit2 size={14} color="black"/></View>
          </View>
        </View>
        <InputField label="Nome" value={USER_DATA.name} />
        <InputField label="Bio" value={USER_DATA.bio} />
        <InputField label="Link" value={USER_DATA.link} />
        <View style={{ height: 40 }} />
        <Button onClick={onBack}>Guardar Alterações</Button>
      </ScrollView>
    </View>
  </View>
);

const SettingsView = ({ onBack }: { onBack: () => void }) => (
  <View style={styles.fullScreenContainer}>
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Definições</Text>
      <TouchableOpacity onPress={onBack}><X color="white" size={24} /></TouchableOpacity>
    </View>
    <View style={styles.contentContainer}>
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        {[
          { title: "Conta", items: [{icon: User, label: "Perfil"}, {icon: Lock, label: "Conta"}, {icon: Bell, label: "Notificações"}] },
          { title: "Preferências", items: [{icon: Globe, label: "Idiomas"}, {icon: Zap, label: "Unidades"}, {icon: Smartphone, label: "Wear OS"}, {icon: Layout, label: "Integrações"}, {icon: Moon, label: "Tema"}] }
        ].map((section, idx) => (
          <View key={idx} style={{ marginBottom: 24 }}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.settingsGroup}>
              {section.items.map((item, i) => (
                <TouchableOpacity key={i} style={styles.settingsItem}>
                  <item.icon size={20} color="#9ca3af"/>
                  <Text style={styles.settingsLabel}>{item.label}</Text>
                  <ChevronRight size={16} color="#9ca3af"/>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  </View>
);

const BadgesView = ({ onBack }: { onBack: () => void }) => (
  <View style={styles.fullScreenContainer}>
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Crachás</Text>
      <TouchableOpacity onPress={onBack}><X color="white" size={24} /></TouchableOpacity>
    </View>
    <View style={styles.contentContainer}>
      <ScrollView contentContainerStyle={{ padding: 24, alignItems: 'center' }}>
        <View style={styles.robotAvatar}>
          <Text style={{ fontSize: 40 }}>🤖</Text>
        </View>
        <Text style={styles.userNameTitle}>{USER_DATA.username}</Text>
        
        <View style={styles.statsRow}>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.statNumber}>{USER_DATA.level}</Text>
            <Text style={styles.statLabel}>Nível Pedal</Text>
          </View>
          <View style={styles.verticalDivider} />
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.statNumber}>{USER_DATA.ecoPoints}</Text>
            <Text style={styles.statLabel}>Eco Points</Text>
          </View>
        </View>

        <View style={styles.levelBarContainer}>
          <View style={[styles.levelBarFill, { width: '72%' }]} />
          <View style={styles.levelBarTextContainer}>
            <Text style={styles.levelBarText}>Próximo Nível</Text>
            <Text style={styles.levelBarText}>72%</Text>
          </View>
        </View>

        <View style={styles.badgesList}>
          {USER_DATA.badges.map(badge => (
            <View key={badge.id} style={styles.badgeItem}>
              <View style={[styles.badgeIcon, { backgroundColor: badge.locked ? '#f1f5f9' : '#fef3c7' }]}>
                <Text style={{ fontSize: 24, opacity: badge.locked ? 0.5 : 1 }}>{badge.icon}</Text>
              </View>
              <Text style={[styles.badgeName, { color: badge.locked ? '#94a3b8' : COLORS.darkText }]}>{badge.name}</Text>
              {badge.locked && <Lock size={16} color="#cbd5e1"/>}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  </View>
);

const GoalsView = ({ onBack, onNewGoal }: { onBack: () => void, onNewGoal: () => void }) => (
  <View style={styles.fullScreenContainer}>
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Objetivos</Text>
      <TouchableOpacity onPress={onBack}><X color="white" size={24} /></TouchableOpacity>
    </View>
    <View style={styles.contentContainer}>
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <View style={styles.progressCard}>
          <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>Olá, {USER_DATA.name.split(' ')[0]}</Text>
              <Text style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>Progresso Semanal</Text>
              
              <View style={{ gap: 8 }}>
                <View style={[styles.progressBar, { backgroundColor: '#dcfce7' }]}>
                    <View style={[styles.progressFill, { width: '62%', backgroundColor: COLORS.primaryGreen }]} />
                    <View style={styles.progressTextRow}>
                      <Text style={styles.progressText}>Calorias</Text>
                      <Text style={styles.progressText}>62%</Text>
                    </View>
                </View>
                <View style={[styles.progressBar, { backgroundColor: '#ffedd5' }]}>
                    <View style={[styles.progressFill, { width: '57%', backgroundColor: COLORS.primaryOrange }]} />
                    <View style={styles.progressTextRow}>
                      <Text style={styles.progressText}>Distância</Text>
                      <Text style={styles.progressText}>57%</Text>
                    </View>
                </View>
              </View>
          </View>
        </View>

        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Definição de Objetivos</Text>
        <View style={{ gap: 24, marginBottom: 32 }}>
          <View style={styles.goalRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Text style={{ fontSize: 24 }}>🔥</Text>
                <Text style={{ fontWeight: 'bold' }}>Queimar calorias</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontWeight: 'bold' }}>2,000 <Text style={{ fontWeight: 'normal', color: '#94a3b8', fontSize: 12 }}>cal</Text></Text>
                <Text style={{ fontSize: 10, color: '#94a3b8' }}>5 dias</Text>
              </View>
          </View>
          <View style={styles.goalRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Text style={{ fontSize: 24 }}>🚴</Text>
                <Text style={{ fontWeight: 'bold' }}>Distância</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontWeight: 'bold' }}>300 <Text style={{ fontWeight: 'normal', color: '#94a3b8', fontSize: 12 }}>Km</Text></Text>
                <Text style={{ fontSize: 10, color: '#94a3b8' }}>7 dias</Text>
              </View>
          </View>
        </View>
        <Button onClick={onNewGoal}>Definir Novo Objetivo</Button>
      </ScrollView>
    </View>
  </View>
);

const NewGoalView = ({ onBack }: { onBack: () => void }) => (
  <View style={styles.fullScreenContainer}>
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Novo Objetivo</Text>
      <TouchableOpacity onPress={onBack}><X color="white" size={24} /></TouchableOpacity>
    </View>
    <View style={styles.contentContainer}>
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <View style={{ gap: 20, marginBottom: 32 }}>
          <View>
              <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Tipo de Objetivo</Text>
              <View style={styles.dropdown}>
                <Text style={{ color: '#6b7280' }}>Duração</Text>
                <ChevronDown size={20} color="#9ca3af"/>
              </View>
          </View>
          <View>
              <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Valor</Text>
              <TextInput style={styles.inputSimple} defaultValue="600" keyboardType="numeric" />
          </View>
          <View>
              <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Período</Text>
              <View style={styles.dropdown}>
                <Text style={{ color: '#6b7280' }}>Dia</Text>
                <ChevronDown size={20} color="#9ca3af"/>
              </View>
          </View>
        </View>
        <Button onClick={onBack}>Guardar</Button>
      </ScrollView>
    </View>
  </View>
);

// --- VIEWS PRINCIPAIS ---

const HomeView = () => {
  const [routeState, setRouteState] = useState<'search' | 'confirm' | 'navigating'>('search');
  const [rideMode, setRideMode] = useState('Turist');

  return (
    <View style={{ flex: 1, backgroundColor: '#eff6ff' }}>
      <InteractiveMap />
      
      {/* Overlay de Rota SVG */}
      {(routeState === 'confirm' || routeState === 'navigating') && (
         <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <Svg height="100%" width="100%">
              {/* Ajustar coordenadas conforme necessário para o teu layout */}
               <Path d="M100,200 Q200,300 300,500" fill="none" stroke="#4338ca" strokeWidth="5" strokeDasharray="10,5" />
               <SvgCircle cx="100" cy="200" r="8" fill="#facc15" stroke="white" strokeWidth="3" />
               <SvgCircle cx="300" cy="500" r="8" fill="#ef4444" stroke="white" strokeWidth="3" />
               {routeState === 'navigating' && (
                  <SvgCircle cx="200" cy="300" r="12" fill={COLORS.primaryGreen} stroke="white" strokeWidth="4" />
               )}
            </Svg>
         </View>
      )}

      {/* Painel Inferior */}
      {routeState === 'search' && (
        <View style={[styles.bottomSheet, { height: '55%' }]}>
          <View style={{ paddingHorizontal: 24, marginTop: -30 }}>
            <View style={styles.searchCard}>
              <View style={styles.searchRow}>
                <MapPin color={COLORS.primaryOrange} size={20} />
                <TextInput style={styles.searchInput} placeholder="Onde estás?" />
              </View>
              <View style={styles.searchDivider} />
              <View style={styles.searchRow}>
                <MapPin color="#ef4444" size={20} />
                <TextInput 
                  style={styles.searchInput} 
                  placeholder="Para onde vais?" 
                  onFocus={() => setRouteState('confirm')}
                />
              </View>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ padding: 24 }}>
              <Text style={styles.sectionHeader}>Rotas Recentes</Text>
              {[1, 2, 3].map(i => (
                <TouchableOpacity key={i} style={styles.routeItem} onPress={() => setRouteState('confirm')}>
                  <Image source={{ uri: `https://source.unsplash.com/random/100x100?road,${i}` }} style={styles.routeThumb} />
                  <View>
                      <Text style={{ fontWeight: 'bold' }}>Casa <Text style={{color:'#ccc'}}>•••</Text> Trabalho</Text>
                      <Text style={{ color: '#9ca3af', fontSize: 12 }}>13 km • 17 min</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {routeState === 'confirm' && (
        <View style={styles.bottomSheet}>
           <View style={{ padding: 24 }}>
              <View style={styles.routeSummaryCard}>
                 <View style={styles.routeSummaryRow}><MapPin color="#facc15" size={20} /><Text style={{marginLeft: 10, fontWeight: 'bold'}}>Origem</Text></View>
                 <View style={styles.routeSummaryRow}><MapPin color="#ef4444" size={20} /><Text style={{marginLeft: 10, fontWeight: 'bold'}}>Destino</Text></View>
              </View>
              
              <Text style={{ fontWeight: 'bold', marginBottom: 12 }}>Modo de Viagem</Text>
              <View style={styles.modeSelector}>
                 {['Sport', 'Turist', 'Safest'].map(mode => (
                    <TouchableOpacity key={mode} onPress={() => setRideMode(mode)} style={[styles.modeBtn, rideMode === mode && styles.modeBtnActive]}>
                       <Text style={{ fontSize: 12, fontWeight: 'bold', color: rideMode === mode ? COLORS.primaryGreen : '#9ca3af' }}>{mode}</Text>
                    </TouchableOpacity>
                 ))}
              </View>

              <View style={{ flexDirection: 'row', gap: 16 }}>
                 <Button variant="outline" style={{ flex: 1 }} onClick={() => setRouteState('search')}>Cancelar</Button>
                 <Button style={{ flex: 1 }} onClick={() => setRouteState('navigating')}>Iniciar</Button>
              </View>
           </View>
        </View>
      )}

      {routeState === 'navigating' && (
        <>
          <TouchableOpacity onPress={() => setRouteState('confirm')} style={styles.backButtonMap}>
             <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          
          <View style={styles.navPanel}>
             <View style={{ alignItems: 'center' }}>
                <View style={styles.navIconBox}><AlertTriangle color="#f97316" size={24}/></View>
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#666' }}>Em 100m</Text>
             </View>
             <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold' }}>13:06</Text>
                <Text style={{ color: '#9ca3af', fontWeight: 'bold', fontSize: 12 }}>3 MIN • 0.6 KM</Text>
             </View>
             <TouchableOpacity style={styles.navSearchBtn}><Search size={24} color="#333"/></TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const FavoritesView = () => {
  const [tab, setTab] = useState<'Routes' | 'Locations'>('Routes');
  return (
    <View style={styles.fullScreenContainer}>
      <View style={[styles.header, { paddingBottom: 0 }]}>
         <Text style={styles.headerTitle}>Favoritos</Text>
         <View style={styles.tabContainer}>
            <TouchableOpacity onPress={() => setTab('Routes')} style={[styles.tab, tab === 'Routes' && styles.tabActive]}><Text style={styles.tabText}>Rotas</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setTab('Locations')} style={[styles.tab, tab === 'Locations' && styles.tabActive]}><Text style={styles.tabText}>Locais</Text></TouchableOpacity>
         </View>
      </View>
      <View style={styles.contentContainer}>
         <View style={styles.mapPreview}><InteractiveMap /></View>
         <ScrollView contentContainerStyle={{ padding: 24 }}>
            {(tab === 'Routes' ? [1,2] : [1,2,3]).map(i => (
              <View key={i} style={styles.favItem}>
                 <Image source={{ uri: `https://source.unsplash.com/random/100x100?map,${i}` }} style={styles.favThumb} />
                 <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: 'bold' }}>{tab === 'Routes' ? 'Rota Casa-Trabalho' : 'Casa'}</Text>
                    <Text style={{ fontSize: 12, color: '#999' }}>12km • 25min</Text>
                 </View>
                 <Button style={{ paddingVertical: 8, paddingHorizontal: 16 }}>Ir</Button>
              </View>
            ))}
         </ScrollView>
      </View>
    </View>
  );
};

const CommunityView = () => (
  <View style={{ flex: 1, backgroundColor: COLORS.lightGray }}>
    <View style={{ padding: 24, paddingTop: 60 }}>
       <Text style={{ fontSize: 32, fontWeight: 'bold', color: COLORS.darkText }}>Descobrir</Text>
       <Text style={{ color: '#666' }}>Explora rotas da comunidade.</Text>
    </View>
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <View style={styles.communityFilters}>
            {['Tendências', 'POI', 'Grupos', 'Rotas'].map(f => (
              <TouchableOpacity key={f} style={{ alignItems: 'center' }}>
                  <View style={styles.filterBtn}><Star size={20} color={COLORS.primaryOrange}/></View>
                  <Text style={styles.filterLabel}>{f}</Text>
              </TouchableOpacity>
            ))}
        </View>
        <View style={styles.feedCard}>
            <Image source={{ uri: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=500" }} style={styles.feedImage} />
            <View style={{ padding: 16 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Passeio na Floresta</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                  <Text style={{ fontSize: 12, color: '#666' }}>14 km • Dificuldade Média</Text>
                  <Heart size={16} color="#999" />
              </View>
            </View>
        </View>
      </ScrollView>
    </View>
  </View>
);

const ProfileView = () => {
  const [subView, setSubView] = useState<'main' | 'edit' | 'settings' | 'badges' | 'goals' | 'newgoal'>('main');

  if (subView === 'edit') return <EditProfileView onBack={() => setSubView('main')} />;
  if (subView === 'settings') return <SettingsView onBack={() => setSubView('main')} />;
  if (subView === 'badges') return <BadgesView onBack={() => setSubView('main')} />;
  if (subView === 'goals') return <GoalsView onBack={() => setSubView('main')} onNewGoal={() => setSubView('newgoal')} />;
  if (subView === 'newgoal') return <NewGoalView onBack={() => setSubView('goals')} />;

  return (
    <View style={styles.fullScreenContainer}>
      <View style={[styles.header, { justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }]}>
         <TouchableOpacity onPress={() => setSubView('edit')}><Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>Editar</Text></TouchableOpacity>
         <TouchableOpacity onPress={() => setSubView('settings')}><Settings color="white" size={24} /></TouchableOpacity>
      </View>
      <View style={styles.contentContainer}>
        <ScrollView contentContainerStyle={{ padding: 24 }}>
          <View style={styles.profileHeaderCard}>
              <Image source={{ uri: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200" }} style={styles.avatar} />
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={styles.profileName}>{USER_DATA.name}</Text>
                <View style={styles.statsContainer}>
                    <View><Text style={styles.statVal}>270</Text><Text style={styles.statLbl}>Rides</Text></View>
                    <View><Text style={styles.statVal}>102</Text><Text style={styles.statLbl}>Seguidores</Text></View>
                    <View><Text style={styles.statVal}>178</Text><Text style={styles.statLbl}>A Seguir</Text></View>
                </View>
              </View>
          </View>
          
          <View style={styles.dashboardSection}>
              <Text style={styles.sectionTitle}>Dashboard</Text>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <TouchableOpacity onPress={() => setSubView('badges')} style={styles.dashBtn}><Text style={styles.dashBtnText}>Crachás</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setSubView('goals')} style={styles.dashBtn}><Text style={styles.dashBtnText}>Objetivos</Text></TouchableOpacity>
              </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const App = () => {
  const [tab, setTab] = useState<'home' | 'favorites' | 'community' | 'profile'>('home');

  const renderContent = () => {
    switch(tab) {
      case 'home': return <HomeView />;
      case 'favorites': return <FavoritesView />;
      case 'community': return <CommunityView />;
      case 'profile': return <ProfileView />;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar barStyle="dark-content" />
      <View style={{ flex: 1 }}>{renderContent()}</View>
      <View style={styles.bottomNav}>
         <TouchableOpacity onPress={() => setTab('home')} style={{ alignItems: 'center' }}>
            <Home color={tab === 'home' ? COLORS.primaryOrange : '#999'} />
            <Text style={{ fontSize: 10, color: tab === 'home' ? COLORS.primaryOrange : '#999' }}>Home</Text>
         </TouchableOpacity>
         <TouchableOpacity onPress={() => setTab('favorites')} style={{ alignItems: 'center' }}>
            <Heart color={tab === 'favorites' ? COLORS.primaryOrange : '#999'} />
            <Text style={{ fontSize: 10, color: tab === 'favorites' ? COLORS.primaryOrange : '#999' }}>Favoritos</Text>
         </TouchableOpacity>
         <TouchableOpacity onPress={() => setTab('community')} style={{ alignItems: 'center' }}>
            <MessageCircle color={tab === 'community' ? COLORS.primaryOrange : '#999'} />
            <Text style={{ fontSize: 10, color: tab === 'community' ? COLORS.primaryOrange : '#999' }}>Comunidade</Text>
         </TouchableOpacity>
         <TouchableOpacity onPress={() => setTab('profile')} style={{ alignItems: 'center' }}>
            <User color={tab === 'profile' ? COLORS.primaryOrange : '#999'} />
            <Text style={{ fontSize: 10, color: tab === 'profile' ? COLORS.primaryOrange : '#999' }}>Perfil</Text>
         </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// --- STYLESHEET ---

const styles = StyleSheet.create({
  fullScreenContainer: { flex: 1, backgroundColor: COLORS.primaryGreen },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 24 },
  headerTitle: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  contentContainer: { flex: 1, backgroundColor: '#F5F7F8', borderTopLeftRadius: 40, borderTopRightRadius: 40, overflow: 'hidden' },
  
  buttonBase: { paddingVertical: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  
  label: { marginLeft: 4, marginBottom: 4, fontWeight: '600', color: '#333' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 16, paddingHorizontal: 14 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16 },
  
  mapContainer: { ...StyleSheet.absoluteFillObject, height: Dimensions.get('window').height, width: Dimensions.get('window').width },
  
  avatarLargeContainer: { position: 'relative' },
  avatarLarge: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: 'white' },
  editIconBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: 'white', padding: 8, borderRadius: 20, elevation: 2 },
  
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#6b7280', marginBottom: 8, textTransform: 'uppercase' },
  settingsGroup: { backgroundColor: 'white', borderRadius: 16, overflow: 'hidden' },
  settingsItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  settingsLabel: { marginLeft: 12, flex: 1, fontWeight: '500' },

  robotAvatar: { width: 80, height: 80, backgroundColor: '#ffedd5', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  userNameTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  statsRow: { flexDirection: 'row', gap: 24, marginBottom: 24 },
  statNumber: { fontSize: 18, fontWeight: 'bold' },
  statLabel: { fontSize: 12, color: '#94a3b8' },
  verticalDivider: { width: 1, backgroundColor: '#cbd5e1' },
  levelBarContainer: { width: '100%', marginBottom: 32 },
  levelBarFill: { backgroundColor: COLORS.teal, height: 32, borderRadius: 16, position: 'absolute', top: 0, left: 0 },
  levelBarTextContainer: { height: 32, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, justifyContent: 'space-between' },
  levelBarText: { color: 'white', fontWeight: 'bold', fontSize: 12, zIndex: 1 },
  badgesList: { width: '100%', backgroundColor: 'white', borderRadius: 24, overflow: 'hidden' },
  badgeItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  badgeIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  badgeName: { flex: 1, fontWeight: 'bold' },

  progressCard: { backgroundColor: 'white', borderRadius: 24, padding: 24, marginBottom: 24 },
  progressBar: { height: 28, borderRadius: 8, justifyContent: 'center', paddingHorizontal: 8 },
  progressFill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 8 },
  progressTextRow: { flexDirection: 'row', justifyContent: 'space-between', position: 'relative' },
  progressText: { fontSize: 10, fontWeight: 'bold', color: 'white' },
  goalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  
  dropdown: { backgroundColor: 'white', padding: 16, borderRadius: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  inputSimple: { backgroundColor: 'white', padding: 16, borderRadius: 16, fontSize: 16, fontWeight: 'bold' },

  bottomSheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, shadowColor: '#000', shadowOffset: {width:0, height:-5}, shadowOpacity:0.1, shadowRadius:10, elevation:20 },
  searchCard: { backgroundColor: 'white', borderRadius: 16, padding: 4, elevation: 5, borderWidth: 1, borderColor: '#f3f4f6' },
  searchRow: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  searchDivider: { height: 1, backgroundColor: '#eee' },
  searchInput: { flex: 1, marginLeft: 12 },
  sectionHeader: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  routeItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  routeThumb: { width: 56, height: 56, borderRadius: 28, marginRight: 16 },
  routeSummaryCard: { backgroundColor: '#f9fafb', borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#e5e7eb' },
  routeSummaryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  modeSelector: { flexDirection: 'row', backgroundColor: '#F0FDF4', padding: 4, borderRadius: 12, marginBottom: 32 },
  modeBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8 },
  modeBtnActive: { backgroundColor: 'white', elevation: 2 },
  backButtonMap: { position: 'absolute', top: 60, left: 16, zIndex: 20, backgroundColor: 'white', padding: 12, borderRadius: 50, elevation: 5 },
  navPanel: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 20 },
  navIconBox: { backgroundColor: '#ffedd5', padding: 12, borderRadius: 16, marginBottom: 4 },
  navSearchBtn: { backgroundColor: 'white', padding: 12, borderRadius: 50, elevation: 5 },

  tabContainer: { flexDirection: 'row' },
  tab: { flex: 1, paddingVertical: 12, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  tabActive: { backgroundColor: '#F5F7F8' },
  tabText: { textAlign: 'center', fontWeight: 'bold' },
  mapPreview: { height: 160, margin: 24, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#eee' },
  favItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  favThumb: { width: 56, height: 56, borderRadius: 28 },

  communityFilters: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  filterBtn: { width: 48, height: 48, borderRadius: 16, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ffedd5', marginBottom: 8 },
  filterLabel: { fontSize: 10, fontWeight: 'bold', color: COLORS.primaryOrange },
  feedCard: { backgroundColor: 'white', borderRadius: 24, overflow: 'hidden', marginBottom: 24, elevation: 2 },
  feedImage: { width: '100%', height: 160 },

  profileHeaderCard: { backgroundColor: 'white', marginTop: -40, borderRadius: 24, padding: 24, flexDirection: 'row', alignItems: 'center', elevation: 5 },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: 'white' },
  profileName: { fontSize: 20, fontWeight: 'bold' },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingRight: 16 },
  statVal: { fontSize: 16, fontWeight: 'bold' },
  statLbl: { fontSize: 12, color: '#666' },
  dashboardSection: { marginTop: 24, marginBottom: 40 },
  dashBtn: { flex: 1, backgroundColor: COLORS.primaryOrange, paddingVertical: 16, borderRadius: 12, alignItems: 'center', elevation: 4 },
  dashBtnText: { color: 'white', fontWeight: 'bold' },

  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12, borderTopWidth: 1, borderColor: '#f3f4f6', backgroundColor: 'white', paddingBottom: 30 },
});

export default App;