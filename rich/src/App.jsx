import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "./supabaseClient";

/* ============================================================
   DATOS — Premier League 2026/27 (planteles normalizados)
   Cada jugador: { name, pos, sp } donde sp es un array opcional
   de setpieces: "P" (penal), "P2" (2do penal), "TL" (tiro libre), "C" (corner)
   ============================================================ */

const RAW_TEAMS = [
  {
    name: "Arsenal",
    players: [
      { name: "David Raya", pos: "ARQ" },
      { name: "Kepa", pos: "ARQ" },
      { name: "Meslier", pos: "ARQ" },
      { name: "Gabriel", pos: "DEF" },
      { name: "Timber", pos: "DEF" },
      { name: "Mosquera", pos: "DEF" },
      { name: "Calafiori", pos: "DEF" },
      { name: "White", pos: "DEF" },
      { name: "Hincapié", pos: "DEF" },
      { name: "Lewis Skelly", pos: "DEF" },
      { name: "Saliba", pos: "DEF" },
      { name: "Rice", pos: "MED", sp: ["TL", "C"] },
      { name: "Bruno Guimarães", pos: "MED" },
      { name: "Odegaard", pos: "MED" },
      { name: "Eze", pos: "MED", sp: ["TL"] },
      { name: "Merino", pos: "MED" },
      { name: "Zubimendi", pos: "MED" },
      { name: "Dowman", pos: "MED" },
      { name: "Nwaneri", pos: "MED" },
      { name: "Saka", pos: "DEL", sp: ["P2", "C"] },
      { name: "Gyokeres", pos: "DEL", sp: ["P"] },
      { name: "Tzolis", pos: "DEL" },
      { name: "Martinelli", pos: "DEL" },
      { name: "Madueke", pos: "DEL" },
      { name: "Havertz", pos: "DEL" },
      { name: "Jesus", pos: "DEL" },
    ],
  },
  {
    name: "Manchester City",
    players: [
      { name: "Gianluigi Donnarumma", pos: "ARQ" },
      { name: "Rulli", pos: "ARQ" },
      { name: "Ruben Dias", pos: "DEF" },
      { name: "O’Riley", pos: "DEF" },
      { name: "Guehi", pos: "DEF" },
      { name: "Gvardiol", pos: "DEF" },
      { name: "Ait Nouri", pos: "DEF" },
      { name: "Khusanov", pos: "DEF" },
      { name: "Foden", pos: "MED", sp: ["TL", "C"] },
      { name: "Cherki", pos: "MED", sp: ["TL", "C"] },
      { name: "Elliot Anderson", pos: "MED" },
      { name: "Reijinders", pos: "MED" },
      { name: "Nunes", pos: "MED" },
      { name: "Nico Gonzalez", pos: "MED" },
      { name: "Grealish", pos: "MED" },
      { name: "Echeverri", pos: "MED" },
      { name: "Haaland", pos: "DEL", sp: ["P"] },
      { name: "Semenyo", pos: "DEL", sp: ["P2"] },
      { name: "Doku", pos: "DEL" },
      { name: "Marmoush", pos: "DEL", sp: ["P2"] },
      { name: "Savinho", pos: "DEL" },
    ],
  },
  {
    name: "Aston Villa",
    players: [
      { name: "Emiliano Martínez", pos: "ARQ" },
      { name: "Bizot", pos: "ARQ" },
      { name: "Cash", pos: "DEF", sp: ["C"] },
      { name: "Konsa", pos: "DEF" },
      { name: "Pau Torres", pos: "DEF" },
      { name: "Maatsen", pos: "DEF" },
      { name: "Lindelof", pos: "DEF" },
      { name: "Mings", pos: "DEF" },
      { name: "Buendía", pos: "MED", sp: ["P", "TL"] },
      { name: "Manzambi", pos: "MED" },
      { name: "Joao Gomes", pos: "MED" },
      { name: "McGinn", pos: "MED", sp: ["C"] },
      { name: "Kamara", pos: "MED" },
      { name: "Onana", pos: "MED" },
      { name: "Barkley", pos: "MED" },
      { name: "Watkins", pos: "DEL", sp: ["P2"] },
      { name: "Garnacho", pos: "DEL" },
      { name: "Abraham", pos: "DEL" },
      { name: "Guessand", pos: "DEL" },
    ],
  },
  {
    name: "Chelsea",
    players: [
      { name: "Sanchez", pos: "ARQ" },
      { name: "Jorgensen", pos: "ARQ" },
      { name: "Colwill", pos: "DEF" },
      { name: "Lacroix", pos: "DEF" },
      { name: "Reece James", pos: "DEF", sp: ["TL", "C"] },
      { name: "Pallestra", pos: "DEF" },
      { name: "Malo Gusto", pos: "DEF" },
      { name: "Fofana", pos: "DEF" },
      { name: "Anselmino", pos: "DEF" },
      { name: "Acheampong", pos: "DEF" },
      { name: "Chavarría", pos: "DEF" },
      { name: "Hato", pos: "DEF" },
      { name: "Enzo", pos: "MED", sp: ["P2", "TL"] },
      { name: "Rogers", pos: "MED" },
      { name: "Palmer", pos: "MED", sp: ["P", "TL"] },
      { name: "Caicedo", pos: "MED" },
      { name: "Henderson", pos: "MED" },
      { name: "Barco", pos: "MED" },
      { name: "Mudryk", pos: "MED" },
      { name: "Joao Pedro", pos: "DEL" },
      { name: "Pedro Neto", pos: "DEL", sp: ["C"] },
      { name: "Welbeck", pos: "DEL" },
      { name: "Estevao", pos: "DEL" },
      { name: "Jackson", pos: "DEL" },
      { name: "Quenda", pos: "DEL" },
      { name: "Delap", pos: "DEL" },
    ],
  },
  {
    name: "Manchester United",
    players: [
      { name: "Lammens", pos: "ARQ" },
      { name: "Darlow", pos: "ARQ" },
      { name: "Lisandro Martínez", pos: "DEF" },
      { name: "Dorgu", pos: "DEF" },
      { name: "De Ligt", pos: "DEF" },
      { name: "Yoro", pos: "DEF" },
      { name: "Shaw", pos: "DEF" },
      { name: "Dalot", pos: "DEF" },
      { name: "Mazraoui", pos: "DEF" },
      { name: "Heaven", pos: "DEF" },
      { name: "Maguire", pos: "DEF" },
      { name: "Bruno Fernandes", pos: "MED", sp: ["P", "TL", "C"] },
      { name: "Tielemans", pos: "MED", sp: ["P2"] },
      { name: "Mount", pos: "MED" },
      { name: "Mainoo", pos: "MED" },
      { name: "Ugarte", pos: "MED" },
      { name: "Andrey Santos", pos: "MED" },
      { name: "Cunha", pos: "DEL" },
      { name: "Sesko", pos: "DEL" },
      { name: "Mbeumo", pos: "DEL", sp: ["P2", "C"] },
      { name: "Rashford", pos: "DEL" },
      { name: "Diallo", pos: "DEL" },
      { name: "Zirkzee", pos: "DEL" },
    ],
  },
  {
    name: "Liverpool",
    players: [
      { name: "Alisson", pos: "ARQ" },
      { name: "Mamadashvili", pos: "ARQ" },
      { name: "VVD", pos: "DEF" },
      { name: "Frimpong", pos: "DEF" },
      { name: "Araujo", pos: "DEF" },
      { name: "Kerkez", pos: "DEF" },
      { name: "Jacquet", pos: "DEF" },
      { name: "Bradley", pos: "DEF" },
      { name: "Gomez", pos: "DEF" },
      { name: "Leoni", pos: "DEF" },
      { name: "Dominik Szoboszlai", pos: "MED", sp: ["P2", "TL", "C"] },
      { name: "Wirtz", pos: "MED" },
      { name: "Alexis", pos: "MED" },
      { name: "Gravenberch", pos: "MED" },
      { name: "Jones", pos: "MED" },
      { name: "Endo", pos: "MED" },
      { name: "Isak", pos: "DEL", sp: ["P"] },
      { name: "Gakpo", pos: "DEL", sp: ["C"] },
      { name: "Muñoz", pos: "DEL" },
      { name: "Ekitike", pos: "DEL" },
      { name: "Chiesa", pos: "DEL" },
      { name: "Nguamoah", pos: "DEL" },
    ],
  },
  {
    name: "Sunderland",
    players: [
      { name: "Roefs", pos: "ARQ" },
      { name: "Patterson", pos: "ARQ" },
      { name: "Mukiele", pos: "DEF" },
      { name: "Ballard", pos: "DEF" },
      { name: "Alderete", pos: "DEF" },
      { name: "Reinildo", pos: "DEF" },
      { name: "Geertruida", pos: "DEF" },
      { name: "Hume", pos: "DEF" },
      { name: "Meunier", pos: "DEF" },
      { name: "Xhaka", pos: "MED", sp: ["TL", "C"] },
      { name: "Le Fee", pos: "MED", sp: ["P2", "TL", "C"] },
      { name: "Diarra", pos: "MED", sp: ["P"] },
      { name: "Sadiki", pos: "MED" },
      { name: "Brobbey", pos: "DEL" },
      { name: "Talbi", pos: "DEL" },
      { name: "Isidor", pos: "DEL" },
      { name: "Mayenda", pos: "DEL" },
      { name: "Traore", pos: "DEL" },
    ],
  },
  {
    name: "Crystal Palace",
    players: [
      { name: "Henderson", pos: "ARQ" },
      { name: "Walter Benitez", pos: "ARQ" },
      { name: "Muñoz", pos: "DEF" },
      { name: "Richards", pos: "DEF" },
      { name: "Mingueza", pos: "DEF" },
      { name: "Tomiyasu", pos: "DEF" },
      { name: "Mitchell", pos: "DEF" },
      { name: "Canvot", pos: "DEF" },
      { name: "Pino", pos: "MED", sp: ["TL", "C"] },
      { name: "Wharton", pos: "MED", sp: ["C"] },
      { name: "Kamada", pos: "MED" },
      { name: "Lerma", pos: "MED" },
      { name: "Hughes", pos: "MED" },
      { name: "Mateta", pos: "DEL", sp: ["P"] },
      { name: "Ismaïla Sarr", pos: "DEL", sp: ["P2"] },
      { name: "Brennan", pos: "DEL" },
      { name: "Nketiah", pos: "DEL" },
      { name: "Larsen", pos: "DEL" },
    ],
  },
  {
    name: "Brighton",
    players: [
      { name: "Bart Verbruggen", pos: "ARQ" },
      { name: "Dunk", pos: "DEF" },
      { name: "Vuskovic", pos: "DEF" },
      { name: "Strujik", pos: "DEF" },
      { name: "De Cuyper", pos: "DEF" },
      { name: "Kadioglu", pos: "DEF", sp: ["TL", "C"] },
      { name: "Boscagli", pos: "DEF" },
      { name: "Pascal Groß", pos: "MED", sp: ["P", "C"] },
      { name: "Ayari", pos: "MED", sp: ["TL"] },
      { name: "Diego Gomez", pos: "MED" },
      { name: "Mitoma", pos: "MED" },
      { name: "Gruda", pos: "MED" },
      { name: "O’Riley", pos: "MED", sp: ["P2"] },
      { name: "Baleba", pos: "MED" },
      { name: "Hinshelwood", pos: "MED" },
      { name: "Wieffer", pos: "MED" },
      { name: "Minteh", pos: "DEL" },
      { name: "Rutter", pos: "DEL" },
      { name: "Kostulas", pos: "DEL" },
      { name: "Yohanna", pos: "DEL" },
    ],
  },
  {
    name: "Everton",
    players: [
      { name: "Pickford", pos: "ARQ" },
      { name: "Tarkowski", pos: "DEF" },
      { name: "O’Brien", pos: "DEF" },
      { name: "Mykolenko", pos: "DEF" },
      { name: "Branthwaite", pos: "DEF" },
      { name: "Keane", pos: "DEF" },
      { name: "KDH", pos: "MED", sp: ["C"] },
      { name: "Garner", pos: "MED", sp: ["P2", "TL", "C"] },
      { name: "Alcaraz", pos: "MED" },
      { name: "Dibling", pos: "MED" },
      { name: "Hackney", pos: "MED" },
      { name: "Norgaard", pos: "MED" },
      { name: "Ndiaye", pos: "DEL", sp: ["P"] },
      { name: "Barry", pos: "DEL" },
      { name: "Mcneill", pos: "DEL" },
      { name: "Beto", pos: "DEL" },
    ],
  },
  {
    name: "Newcastle",
    players: [
      { name: "Pope", pos: "ARQ" },
      { name: "Ramsdale", pos: "ARQ" },
      { name: "Thiaw", pos: "DEF" },
      { name: "Hall", pos: "DEF", sp: ["TL", "C"] },
      { name: "Livramento", pos: "DEF" },
      { name: "Botman", pos: "DEF" },
      { name: "Schaar", pos: "DEF" },
      { name: "Burn", pos: "DEF" },
      { name: "Murphy", pos: "MED" },
      { name: "Barnes", pos: "MED" },
      { name: "Miley", pos: "MED" },
      { name: "Joelinton", pos: "MED" },
      { name: "Willock", pos: "MED" },
      { name: "Ramsey", pos: "MED" },
      { name: "Wissa", pos: "DEL" },
      { name: "Elanga", pos: "DEL" },
      { name: "Woltemade", pos: "DEL", sp: ["P2"] },
      { name: "Osula", pos: "DEL" },
      { name: "Toure", pos: "DEL" },
    ],
  },
  {
    name: "Brentford",
    players: [
      { name: "Kelleher", pos: "ARQ" },
      { name: "Kayode", pos: "DEF" },
      { name: "Collins", pos: "DEF" },
      { name: "Hickey", pos: "DEF" },
      { name: "Pinnock", pos: "DEF" },
      { name: "Van Der Berg", pos: "DEF" },
      { name: "Ajer", pos: "DEF" },
      { name: "Schade", pos: "MED" },
      { name: "Damsgaard", pos: "MED", sp: ["C"] },
      { name: "Sangare", pos: "MED" },
      { name: "Jensen", pos: "MED", sp: ["TL", "C"] },
      { name: "Yarmoliuk", pos: "MED" },
      { name: "Igor Thiago", pos: "DEL", sp: ["P"] },
      { name: "Ouattara", pos: "DEL" },
      { name: "Antony", pos: "DEL" },
      { name: "Lewis Potter", pos: "DEL", sp: ["TL"] },
      { name: "Callum Wilson", pos: "DEL", sp: ["P2"] },
    ],
  },
  {
    name: "Fulham",
    players: [
      { name: "Leno", pos: "ARQ" },
      { name: "Robinson", pos: "DEF", sp: ["P2"] },
      { name: "Andersen", pos: "DEF" },
      { name: "Bassey", pos: "DEF" },
      { name: "Cuenca", pos: "DEF" },
      { name: "Tete", pos: "DEF" },
      { name: "Castagne", pos: "DEF" },
      { name: "Palacios", pos: "MED" },
      { name: "Smith Rowe", pos: "MED" },
      { name: "King", pos: "MED" },
      { name: "Sessegnon", pos: "MED" },
      { name: "Berge", pos: "MED" },
      { name: "Bobb", pos: "MED" },
      { name: "Gonzalo Garcia", pos: "DEL", sp: ["P"] },
      { name: "Iwobi", pos: "DEL", sp: ["TL", "C"] },
      { name: "Kevin", pos: "DEL" },
    ],
  },
  {
    name: "Tottenham",
    players: [
      { name: "Guglielmo Vicario", pos: "ARQ" },
      { name: "Dubravka", pos: "ARQ" },
      { name: "Porro", pos: "DEF", sp: ["TL", "C"] },
      { name: "Senesi", pos: "DEF" },
      { name: "Van de Ven", pos: "DEF" },
      { name: "Van Hecke", pos: "DEF" },
      { name: "Spence", pos: "DEF" },
      { name: "Udogie", pos: "DEF" },
      { name: "Danso", pos: "DEF" },
      { name: "Robertson", pos: "DEF" },
      { name: "Mateus Fernan", pos: "MED" },
      { name: "Kudus", pos: "MED", sp: ["P2", "C"] },
      { name: "Maddison", pos: "MED" },
      { name: "Tonali", pos: "MED" },
      { name: "Gallagher", pos: "MED" },
      { name: "Bergvall", pos: "MED" },
      { name: "Bentancur", pos: "MED" },
      { name: "Gray", pos: "MED" },
      { name: "Kulusevski", pos: "MED" },
      { name: "La Niña", pos: "MED" },
      { name: "Pape Sarr", pos: "MED" },
      { name: "Richarlison", pos: "DEL" },
      { name: "Tell", pos: "DEL" },
      { name: "Solanke", pos: "DEL", sp: ["P"] },
      { name: "Odobert", pos: "DEL" },
    ],
  },
  {
    name: "Bournemouth",
    players: [
      { name: "Petrovic", pos: "ARQ" },
      { name: "Truffert", pos: "DEF" },
      { name: "Antonio Silva", pos: "DEF" },
      { name: "Hill", pos: "DEF" },
      { name: "Diakite", pos: "DEF" },
      { name: "Smith", pos: "DEF" },
      { name: "Juanlu", pos: "DEF" },
      { name: "Milosajevic", pos: "DEF" },
      { name: "Tavernier", pos: "MED", sp: ["TL", "C"] },
      { name: "Scott", pos: "MED", sp: ["C"] },
      { name: "Adams", pos: "MED" },
      { name: "Christie", pos: "MED" },
      { name: "Brooks", pos: "MED" },
      { name: "Kroupi", pos: "DEL", sp: ["P2"] },
      { name: "Rayan", pos: "DEL" },
      { name: "Evanilson", pos: "DEL" },
      { name: "Kluivert", pos: "DEL", sp: ["P", "TL"] },
      { name: "Adli", pos: "DEL" },
      { name: "Unal", pos: "DEL" },
      { name: "Alvaro Rodriguez", pos: "DEL" },
    ],
  },
  {
    name: "Leeds",
    players: [
      { name: "Trafford", pos: "ARQ" },
      { name: "Rodon", pos: "DEF" },
      { name: "Bijol", pos: "DEF" },
      { name: "Muharemovic", pos: "DEF" },
      { name: "Justin", pos: "DEF" },
      { name: "Bogle", pos: "DEF" },
      { name: "Harry Wilson", pos: "MED" },
      { name: "Stach", pos: "MED", sp: ["TL", "C"] },
      { name: "Aaronson", pos: "MED" },
      { name: "Longstaff", pos: "MED" },
      { name: "James", pos: "MED" },
      { name: "Tanaka", pos: "MED", sp: ["C"] },
      { name: "Dominic Calvert-Lewin", pos: "DEL", sp: ["P"] },
      { name: "Okafor", pos: "DEL" },
      { name: "Nmecha", pos: "DEL", sp: ["P2"] },
    ],
  },
  {
    name: "Nottingham Forest",
    players: [
      { name: "Sels", pos: "ARQ" },
      { name: "Neco", pos: "DEF" },
      { name: "Milenkovic", pos: "DEF" },
      { name: "Murillo", pos: "DEF" },
      { name: "Savona", pos: "DEF" },
      { name: "Morato", pos: "DEF" },
      { name: "Diomande", pos: "DEF" },
      { name: "Aina", pos: "DEF" },
      { name: "Morgan Gibbs-White", pos: "MED", sp: ["P2", "TL"] },
      { name: "Schlager", pos: "MED" },
      { name: "Dominguez", pos: "MED" },
      { name: "Sangare", pos: "MED" },
      { name: "McAtee", pos: "MED" },
      { name: "Igor Jesus", pos: "DEL", sp: ["P2"] },
      { name: "Ndoye", pos: "DEL" },
      { name: "Wood", pos: "DEL", sp: ["P"] },
      { name: "Kalimuendo", pos: "DEL" },
    ],
  },
  {
    name: "Ipswich",
    players: [
      { name: "Davies", pos: "DEF", sp: ["TL", "C"] },
      { name: "Issa Diop", pos: "DEF" },
      { name: "Marcelino Nulez", pos: "MED" },
      { name: "Lukic", pos: "MED" },
      { name: "Daizen Maeda", pos: "DEL" },
      { name: "Emerson", pos: "DEL" },
      { name: "Fatawu", pos: "DEL" },
    ],
  },
  {
    name: "Hull",
    players: [
      { name: "Gelhardt", pos: "DEL" },
      { name: "Oliver McBurnie", pos: "DEL" },
    ],
  },
  {
    name: "Coventry",
    players: [
      { name: "Haji Wright", pos: "DEL" },
      { name: "Simms", pos: "DEL" },
    ],
  },
];

/* ============================================================
   CONSTANTES DE ESTILO
   ============================================================ */

const POS_LABELS = { ARQ: "Arqueros", DEF: "Defensores", MED: "Mediocampistas", DEL: "Delanteros" };
const POS_ORDER = ["ARQ", "DEF", "MED", "DEL"];
const POS_COLORS = {
  ARQ: { bg: "#FFF3B0", text: "#8a6d00", border: "#F4DE6E" },
  DEF: { bg: "#C7DBFF", text: "#1c3d7a", border: "#9EBFFA" },
  MED: { bg: "#BCEEE3", text: "#0b5c4c", border: "#8FDDC9" },
  DEL: { bg: "#FFD3E4", text: "#8a1f4d", border: "#F9AFCB" },
};
const SP_COLORS = {
  P: { bg: "#FFADA0", text: "#7a1300", label: "P" },
  P2: { bg: "#A9C8FF", text: "#0d3178", label: "P2" },
  TL: { bg: "#B4E6A8", text: "#1c5c0c", label: "TL" },
  C: { bg: "#FFD199", text: "#8a4b00", label: "C" },
};
const SP_TITLES = { P: "Penal", P2: "2do Penal", TL: "Tiro Libre", C: "Corner" };
const STATUS_COLORS = {
  mine: { bg: "#CFEFCB", border: "#7BC96F", text: "#1f5c14" },
  rival: { bg: "#FBD1CE", border: "#EF847C", text: "#7a1f16" },
};

const BG = "#eae6d9";
const RANKINGS_LOCAL_KEY = "draft-pl-rankings";

function slugify(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/* Construye la lista plana de jugadores base con ids estables */
const BASE_PLAYERS = RAW_TEAMS.flatMap((team) =>
  team.players.map((p) => ({
    id: `${slugify(team.name)}--${slugify(p.name)}`,
    name: p.name,
    team: team.name,
    pos: p.pos,
    sp: p.sp || [],
    custom: false,
  }))
);

const TEAM_NAMES = RAW_TEAMS.map((t) => t.name).sort((a, b) => a.localeCompare(b, "es"));

/* ============================================================
   COMPONENTE PRINCIPAL
   ============================================================ */

export default function App() {
  const [customPlayers, setCustomPlayers] = useState([]);
  const [statusMap, setStatusMap] = useState({}); // { [id]: { status: 'mine'|'rival'|null, injured: bool } }
  const [rankings, setRankings] = useState({}); // { [id]: number } — personal, en localStorage
  const [posFilter, setPosFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [view, setView] = useState("matrix"); // 'matrix' | 'myteam'
  const [showAddForm, setShowAddForm] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [syncNote, setSyncNote] = useState("");

  const allPlayers = useMemo(() => [...BASE_PLAYERS, ...customPlayers], [customPlayers]);

  /* ---------- Carga inicial + suscripción realtime ---------- */
  useEffect(() => {
    let isMounted = true;

    async function loadInitial() {
      const { data: statusRows, error: statusErr } = await supabase.from("draft_status").select("*");
      if (statusErr) {
        setSyncNote("No se pudo conectar con Supabase. Revisá las variables de entorno.");
      } else if (statusRows && isMounted) {
        const map = {};
        statusRows.forEach((r) => {
          map[r.player_id] = { status: r.status, injured: !!r.injured };
        });
        setStatusMap(map);
      }

      const { data: customRows } = await supabase.from("custom_players").select("*");
      if (customRows && isMounted) {
        setCustomPlayers(
          customRows.map((r) => ({ id: r.id, name: r.name, team: r.team, pos: r.pos, sp: [], custom: true }))
        );
      }

      if (isMounted) setLoaded(true);
    }

    loadInitial();

    const statusChannel = supabase
      .channel("draft-status-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "draft_status" }, (payload) => {
        setStatusMap((prev) => {
          if (payload.eventType === "DELETE") {
            const next = { ...prev };
            delete next[payload.old.player_id];
            return next;
          }
          const row = payload.new;
          return { ...prev, [row.player_id]: { status: row.status, injured: !!row.injured } };
        });
      })
      .subscribe();

    const customChannel = supabase
      .channel("custom-players-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "custom_players" }, (payload) => {
        if (payload.eventType === "INSERT") {
          const r = payload.new;
          setCustomPlayers((prev) =>
            prev.some((p) => p.id === r.id) ? prev : [...prev, { id: r.id, name: r.name, team: r.team, pos: r.pos, sp: [], custom: true }]
          );
        } else if (payload.eventType === "DELETE") {
          setCustomPlayers((prev) => prev.filter((p) => p.id !== payload.old.id));
        }
      })
      .subscribe();

    // Rankings personales (no se comparten, viven en este navegador)
    try {
      const saved = window.localStorage.getItem(RANKINGS_LOCAL_KEY);
      if (saved) setRankings(JSON.parse(saved));
    } catch (e) {
      /* ignore */
    }

    return () => {
      isMounted = false;
      supabase.removeChannel(statusChannel);
      supabase.removeChannel(customChannel);
    };
  }, []);

  /* ---------- Escritura ---------- */
  const setPlayerStatus = useCallback(
    async (id, status) => {
      const current = statusMap[id] || {};
      const nextStatus = current.status === status ? null : status;
      const injured = current.injured || false;
      setStatusMap((prev) => ({ ...prev, [id]: { status: nextStatus, injured } }));
      const { error } = await supabase
        .from("draft_status")
        .upsert({ player_id: id, status: nextStatus, injured, updated_at: new Date().toISOString() });
      if (error) setSyncNote("No se pudo sincronizar el último cambio. Revisá tu conexión.");
    },
    [statusMap]
  );

  const toggleInjured = useCallback(
    async (id) => {
      const current = statusMap[id] || {};
      const nextInjured = !current.injured;
      setStatusMap((prev) => ({ ...prev, [id]: { status: current.status || null, injured: nextInjured } }));
      const { error } = await supabase
        .from("draft_status")
        .upsert({ player_id: id, status: current.status || null, injured: nextInjured, updated_at: new Date().toISOString() });
      if (error) setSyncNote("No se pudo sincronizar el último cambio. Revisá tu conexión.");
    },
    [statusMap]
  );

  const setRanking = (id, value) => {
    setRankings((prev) => {
      const next = { ...prev };
      if (value === "" || value === null) {
        delete next[id];
      } else {
        next[id] = Number(value);
      }
      try {
        window.localStorage.setItem(RANKINGS_LOCAL_KEY, JSON.stringify(next));
      } catch (e) {
        /* ignore */
      }
      return next;
    });
  };

  const addPlayer = async (name, team, pos) => {
    const id = `custom--${slugify(team)}--${slugify(name)}--${Date.now()}`;
    const player = { id, name, team, pos, sp: [], custom: true };
    setCustomPlayers((prev) => [...prev, player]);
    setShowAddForm(false);
    const { error } = await supabase.from("custom_players").insert({ id, name, team, pos });
    if (error) setSyncNote("No se pudo guardar el jugador agregado. Revisá tu conexión.");
  };

  /* ---------- Derivados ---------- */
  const counts = useMemo(() => {
    const c = { ALL: allPlayers.length, ARQ: 0, DEF: 0, MED: 0, DEL: 0 };
    allPlayers.forEach((p) => (c[p.pos] = (c[p.pos] || 0) + 1));
    return c;
  }, [allPlayers]);

  const searchLower = search.trim().toLowerCase();

  const matchesFilters = (p) => {
    if (posFilter !== "ALL" && p.pos !== posFilter) return false;
    if (searchLower && !p.name.toLowerCase().includes(searchLower)) return false;
    return true;
  };

  const teamsForMatrix = useMemo(() => {
    return TEAM_NAMES.map((teamName) => {
      const players = allPlayers.filter((p) => p.team === teamName && matchesFilters(p));
      const groups = POS_ORDER.map((pos) => {
        const list = players
          .filter((p) => p.pos === pos)
          .sort((a, b) => {
            const ra = rankings[a.id];
            const rb = rankings[b.id];
            if (ra != null && rb != null) return ra - rb;
            if (ra != null) return -1;
            if (rb != null) return 1;
            return a.name.localeCompare(b.name, "es");
          });
        return { pos, list };
      }).filter((g) => g.list.length > 0);
      return { teamName, groups, total: players.length };
    }).filter((t) => t.total > 0);
  }, [allPlayers, posFilter, searchLower, rankings]);

  const myTeam = useMemo(() => {
    const mine = allPlayers.filter((p) => statusMap[p.id]?.status === "mine");
    const byPos = POS_ORDER.map((pos) => ({
      pos,
      list: mine.filter((p) => p.pos === pos).sort((a, b) => a.name.localeCompare(b.name, "es")),
    })).filter((g) => g.list.length > 0);
    const byTeam = {};
    mine.forEach((p) => {
      byTeam[p.team] = (byTeam[p.team] || 0) + 1;
    });
    return { byPos, byTeam, total: mine.length };
  }, [allPlayers, statusMap]);

  /* ---------- Render ---------- */
  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Inter', sans-serif", color: "#2a2a24" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&display=swap');
        .bebas { font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.03em; }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { height: 10px; width: 10px; }
        ::-webkit-scrollbar-thumb { background: #cfc9b4; border-radius: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        button { cursor: pointer; font-family: inherit; }
        input { font-family: inherit; }
      `}</style>

      <Header total={counts.ALL} loaded={loaded} view={view} setView={setView} myCount={myTeam.total} onAdd={() => setShowAddForm(true)} />

      <FilterBar posFilter={posFilter} setPosFilter={setPosFilter} counts={counts} search={search} setSearch={setSearch} />

      {syncNote && (
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 16px" }}>
          <div style={{ background: "#FBD1CE", color: "#7a1f16", padding: "8px 12px", borderRadius: 8, fontSize: 13, marginTop: 8 }}>
            {syncNote}
          </div>
        </div>
      )}

      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "16px" }}>
        {view === "matrix" ? (
          <Matrix teams={teamsForMatrix} statusMap={statusMap} rankings={rankings} setPlayerStatus={setPlayerStatus} toggleInjured={toggleInjured} setRanking={setRanking} />
        ) : (
          <MyTeamPanel myTeam={myTeam} statusMap={statusMap} toggleInjured={toggleInjured} setPlayerStatus={setPlayerStatus} />
        )}
      </main>

      {showAddForm && <AddPlayerModal onClose={() => setShowAddForm(false)} onAdd={addPlayer} />}
    </div>
  );
}

/* ============================================================
   HEADER
   ============================================================ */
function Header({ total, loaded, view, setView, myCount, onAdd }) {
  return (
    <header style={{ background: "#20201c", color: "#f5f2e8", padding: "18px 16px" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="bebas" style={{ fontSize: 34, margin: 0, lineHeight: 1 }}>
            DRAFT · PREMIER LEAGUE 2026/27
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.75 }}>
            {total} jugadores cargados {loaded ? "· sincronizado" : "· cargando..."}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ display: "flex", background: "#33322c", borderRadius: 10, padding: 3 }}>
            <ToggleBtn active={view === "matrix"} onClick={() => setView("matrix")} label="Matriz" />
            <ToggleBtn active={view === "myteam"} onClick={() => setView("myteam")} label={`Mi Equipo (${myCount})`} />
          </div>
          <button
            onClick={onAdd}
            style={{
              background: "#EDE8D6",
              color: "#20201c",
              border: "none",
              borderRadius: 10,
              padding: "10px 16px",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            + Agregar jugador
          </button>
        </div>
      </div>
    </header>
  );
}

function ToggleBtn({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? "#EDE8D6" : "transparent",
        color: active ? "#20201c" : "#f5f2e8",
        border: "none",
        borderRadius: 8,
        padding: "8px 14px",
        fontWeight: 600,
        fontSize: 13,
      }}
    >
      {label}
    </button>
  );
}

/* ============================================================
   FILTER BAR
   ============================================================ */
function FilterBar({ posFilter, setPosFilter, counts, search, setSearch }) {
  const items = [
    { key: "ALL", label: "Todos" },
    { key: "ARQ", label: "Arqueros" },
    { key: "DEF", label: "Defensores" },
    { key: "MED", label: "Mediocampistas" },
    { key: "DEL", label: "Delanteros" },
  ];
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 20, background: BG, borderBottom: "1px solid #d8d2bd", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "12px 16px", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {items.map((it) => {
            const isPos = it.key !== "ALL";
            const colors = isPos ? POS_COLORS[it.key] : { bg: "#20201c", text: "#f5f2e8", border: "#20201c" };
            const active = posFilter === it.key;
            return (
              <button
                key={it.key}
                onClick={() => setPosFilter(it.key)}
                style={{
                  background: active ? colors.bg : "#fff",
                  color: active ? colors.text : "#5c584a",
                  border: `1.5px solid ${active ? colors.border : "#d8d2bd"}`,
                  borderRadius: 999,
                  padding: "7px 13px",
                  fontSize: 13,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {it.label}
                <span style={{ opacity: 0.65, fontWeight: 500 }}>{counts[it.key] ?? 0}</span>
              </button>
            );
          })}
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar jugador..."
          style={{
            flex: "1 1 200px",
            minWidth: 160,
            padding: "9px 14px",
            borderRadius: 999,
            border: "1.5px solid #d8d2bd",
            fontSize: 13,
            background: "#fff",
            outline: "none",
          }}
        />
      </div>
    </div>
  );
}

/* ============================================================
   MATRIX VIEW
   ============================================================ */
function Matrix({ teams, statusMap, rankings, setPlayerStatus, toggleInjured, setRanking }) {
  if (teams.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px", color: "#7a7666" }}>
        <p className="bebas" style={{ fontSize: 26 }}>SIN RESULTADOS</p>
        <p style={{ fontSize: 14 }}>Probá con otro filtro o término de búsqueda.</p>
      </div>
    );
  }
  return (
    <div style={{ overflowX: "auto", paddingBottom: 12 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", minWidth: "max-content" }}>
        {teams.map((t) => (
          <TeamColumn
            key={t.teamName}
            team={t}
            statusMap={statusMap}
            rankings={rankings}
            setPlayerStatus={setPlayerStatus}
            toggleInjured={toggleInjured}
            setRanking={setRanking}
          />
        ))}
      </div>
    </div>
  );
}

function TeamColumn({ team, statusMap, rankings, setPlayerStatus, toggleInjured, setRanking }) {
  return (
    <div style={{ width: 232, flex: "0 0 232px", background: "#fff", borderRadius: 14, border: "1px solid #e2ddc9", overflow: "hidden" }}>
      <div style={{ background: "#20201c", color: "#f5f2e8", padding: "10px 12px" }}>
        <h3 className="bebas" style={{ margin: 0, fontSize: 20, lineHeight: 1.1 }}>{team.teamName}</h3>
      </div>
      <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 10 }}>
        {team.groups.map((g) => (
          <div key={g.pos}>
            <PosBadge pos={g.pos} small />
            <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 5 }}>
              {g.list.map((p) => (
                <PlayerRow
                  key={p.id}
                  player={p}
                  status={statusMap[p.id]}
                  ranking={rankings[p.id]}
                  onStatus={(s) => setPlayerStatus(p.id, s)}
                  onInjured={() => toggleInjured(p.id)}
                  onRank={(v) => setRanking(p.id, v)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PosBadge({ pos, small }) {
  const c = POS_COLORS[pos];
  return (
    <span
      style={{
        display: "inline-block",
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        borderRadius: 6,
        padding: small ? "2px 8px" : "3px 10px",
        fontSize: small ? 11 : 12,
        fontWeight: 700,
        letterSpacing: "0.03em",
      }}
    >
      {pos}
    </span>
  );
}

function SpDots({ sp }) {
  if (!sp || sp.length === 0) return null;
  return (
    <span style={{ display: "inline-flex", gap: 3, marginLeft: 6 }}>
      {sp.map((tag) => (
        <span
          key={tag}
          title={SP_TITLES[tag]}
          style={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: SP_COLORS[tag].bg,
            color: SP_COLORS[tag].text,
            fontSize: 8,
            fontWeight: 800,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
          }}
        >
          {SP_COLORS[tag].label}
        </span>
      ))}
    </span>
  );
}

function PlayerRow({ player, status, ranking, onStatus, onInjured, onRank }) {
  const st = status?.status;
  const injured = status?.injured;
  const bg = st === "mine" ? STATUS_COLORS.mine.bg : st === "rival" ? STATUS_COLORS.rival.bg : "#f7f5ee";
  const border = st === "mine" ? STATUS_COLORS.mine.border : st === "rival" ? STATUS_COLORS.rival.border : "#e2ddc9";

  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 8,
        padding: "6px 8px",
        opacity: st === "rival" ? 0.6 : 1,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
        <span
          style={{
            fontSize: 12.5,
            fontWeight: 600,
            textDecoration: st === "rival" ? "line-through" : "none",
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            minWidth: 0,
          }}
        >
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 108 }}>{player.name}</span>
          <SpDots sp={player.sp} />
          {injured && <span style={{ marginLeft: 4 }}>🩹</span>}
        </span>
        <input
          type="number"
          value={ranking ?? ""}
          onChange={(e) => onRank(e.target.value)}
          placeholder="#"
          style={{
            width: 30,
            fontSize: 11,
            padding: "2px 3px",
            borderRadius: 5,
            border: "1px solid #d8d2bd",
            textAlign: "center",
          }}
        />
      </div>
      <div style={{ display: "flex", gap: 4, marginTop: 5 }}>
        <StatusBtn active={st === "mine"} color="#4CAF50" onClick={() => onStatus("mine")} icon="✓" title="Mío" />
        <StatusBtn active={st === "rival"} color="#E53935" onClick={() => onStatus("rival")} icon="✕" title="Rival" />
        <StatusBtn active={injured} color="#FB8C00" onClick={onInjured} icon="🩹" title="Lesionado" />
      </div>
    </div>
  );
}

function StatusBtn({ active, color, onClick, icon, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        flex: 1,
        background: active ? color : "#fff",
        color: active ? "#fff" : "#8a8672",
        border: `1px solid ${active ? color : "#d8d2bd"}`,
        borderRadius: 6,
        fontSize: 11,
        padding: "3px 0",
        fontWeight: 700,
      }}
    >
      {icon}
    </button>
  );
}

/* ============================================================
   MI EQUIPO
   ============================================================ */
function MyTeamPanel({ myTeam, statusMap, toggleInjured, setPlayerStatus }) {
  if (myTeam.total === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px", color: "#7a7666" }}>
        <p className="bebas" style={{ fontSize: 26 }}>TODAVÍA NO TENÉS JUGADORES</p>
        <p style={{ fontSize: 14 }}>Marcá jugadores con ✓ en la vista Matriz para armarlo acá.</p>
      </div>
    );
  }

  const teamEntries = Object.entries(myTeam.byTeam).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
        {teamEntries.map(([team, count]) => (
          <div
            key={team}
            style={{
              background: "#fff",
              border: "1px solid #e2ddc9",
              borderRadius: 999,
              padding: "6px 12px",
              fontSize: 12.5,
              fontWeight: 600,
              display: "flex",
              gap: 6,
            }}
          >
            <span>{team}</span>
            <span style={{ background: "#20201c", color: "#f5f2e8", borderRadius: 999, padding: "0 7px", fontSize: 11 }}>{count}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
        {myTeam.byPos.map((g) => (
          <div key={g.pos}>
            <PosBadge pos={g.pos} />
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
              {g.list.map((p) => {
                const c = POS_COLORS[p.pos];
                const injured = statusMap[p.id]?.injured;
                return (
                  <div
                    key={p.id}
                    style={{
                      background: c.bg,
                      border: `1px solid ${c.border}`,
                      borderRadius: 10,
                      padding: "10px 12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: c.text, display: "flex", alignItems: "center" }}>
                        {p.name}
                        <SpDots sp={p.sp} />
                        {injured && <span style={{ marginLeft: 4 }}>🩹</span>}
                      </div>
                      <div style={{ fontSize: 11.5, color: c.text, opacity: 0.75 }}>{p.team}</div>
                    </div>
                    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                      <button
                        onClick={() => toggleInjured(p.id)}
                        title="Lesionado"
                        style={{
                          background: injured ? "#FB8C00" : "#fff",
                          color: injured ? "#fff" : "#8a8672",
                          border: "1px solid #d8d2bd",
                          borderRadius: 6,
                          fontSize: 12,
                          padding: "4px 7px",
                        }}
                      >
                        🩹
                      </button>
                      <button
                        onClick={() => setPlayerStatus(p.id, "mine")}
                        title="Quitar de mi equipo"
                        style={{
                          background: "#fff",
                          color: "#8a1f4d",
                          border: "1px solid #d8d2bd",
                          borderRadius: 6,
                          fontSize: 12,
                          padding: "4px 7px",
                          fontWeight: 700,
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   AGREGAR JUGADOR
   ============================================================ */
function AddPlayerModal({ onClose, onAdd }) {
  const [name, setName] = useState("");
  const [team, setTeam] = useState(TEAM_NAMES[0]);
  const [pos, setPos] = useState("MED");

  const submit = () => {
    if (!name.trim()) return;
    onAdd(name.trim(), team, pos);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20,20,16,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#fff", borderRadius: 14, padding: 22, width: "100%", maxWidth: 380 }}
      >
        <h2 className="bebas" style={{ margin: "0 0 14px", fontSize: 24 }}>AGREGAR JUGADOR</h2>

        <label style={labelStyle}>Nombre</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre del jugador"
          style={inputStyle}
        />

        <label style={labelStyle}>Equipo</label>
        <select value={team} onChange={(e) => setTeam(e.target.value)} style={inputStyle}>
          {TEAM_NAMES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <label style={labelStyle}>Posición</label>
        <select value={pos} onChange={(e) => setPos(e.target.value)} style={inputStyle}>
          {POS_ORDER.map((p) => (
            <option key={p} value={p}>{POS_LABELS[p]}</option>
          ))}
        </select>

        <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "1px solid #d8d2bd", background: "#fff", fontWeight: 600 }}
          >
            Cancelar
          </button>
          <button
            onClick={submit}
            style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "none", background: "#20201c", color: "#f5f2e8", fontWeight: 700 }}
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}

const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, margin: "10px 0 4px", color: "#5c584a" };
const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #d8d2bd",
  fontSize: 14,
  background: "#f9f7ef",
};
