// ============================================
// HONIG-REZEPTE – Vorgefertigte Rezepte
// Alle Rezepte gegen echte Quellen validiert
// ============================================

var PRESET_REZEPTE = [

// =============================================
// ESSEN & TRINKEN (30 Rezepte, p1–p40)
// =============================================

{id:'p1', kategorie:'essen', titel:'Klassischer Honigkuchen', beschreibung:'Saftiger Honigkuchen mit Lebkuchengewürz – perfekt zur Kaffeezeit. Wird am nächsten Tag noch saftiger.', schwierigkeit:'leicht', zeitaufwand:65, is_preset:true,
 zutaten:[{menge:'250',einheit:'g',zutat:'Honig'},{menge:'320',einheit:'g',zutat:'Mehl'},{menge:'100',einheit:'g',zutat:'Butter'},{menge:'100',einheit:'g',zutat:'brauner Zucker'},{menge:'2',einheit:'',zutat:'Eier'},{menge:'3',einheit:'EL',zutat:'Milch'},{menge:'1',einheit:'TL',zutat:'Backpulver'},{menge:'1',einheit:'TL',zutat:'Zimt'},{menge:'2',einheit:'TL',zutat:'Lebkuchengewürz'},{menge:'1',einheit:'Prise',zutat:'Nelken (gemahlen)'},{menge:'1',einheit:'Prise',zutat:'Salz'}],
 schritte:['Backofen auf 180°C Ober-/Unterhitze vorheizen. Kastenform einfetten und mit Mehl bestäuben.','Butter, Honig und braunen Zucker in einem Topf bei niedriger Hitze schmelzen und etwas abkühlen lassen.','Eier schaumig schlagen und die Honig-Butter-Mischung unterrühren.','Mehl, Backpulver, Lebkuchengewürz, Zimt, Nelken und Salz mischen, dann vorsichtig unter die Masse heben. Milch einrühren.','In die Kastenform füllen und ca. 50–55 Minuten backen. Stäbchenprobe machen!','10 Minuten in der Form abkühlen lassen, dann stürzen. Der Kuchen wird am nächsten Tag noch saftiger.']},

{id:'p2', kategorie:'essen', titel:'Honig-Senf-Dressing', beschreibung:'Schnelles Salatdressing mit perfekter Honig-Senf-Balance im klassischen 3:1 Öl-Essig-Verhältnis.', schwierigkeit:'leicht', zeitaufwand:5, is_preset:true,
 zutaten:[{menge:'1',einheit:'EL',zutat:'Honig'},{menge:'2',einheit:'EL',zutat:'Dijon-Senf'},{menge:'5',einheit:'EL',zutat:'Olivenöl'},{menge:'2',einheit:'EL',zutat:'Apfelessig'},{menge:'1',einheit:'Prise',zutat:'Salz & Pfeffer'}],
 schritte:['Honig, Senf und Apfelessig in ein Schraubglas geben und verrühren.','Olivenöl in einem dünnen Strahl dazugeben.','Deckel drauf und kräftig schütteln, bis eine cremige Emulsion entsteht.','Mit Salz und Pfeffer abschmecken.','Sofort über den Salat geben oder bis zu 1 Woche im Kühlschrank aufbewahren.']},

{id:'p3', kategorie:'essen', titel:'Met (Honigwein)', beschreibung:'Traditioneller Honigwein – das Getränk der Wikinger, selbst gebraut. Gärzeit ca. 4 Wochen, Reifezeit mindestens 3 Monate.', schwierigkeit:'fortgeschritten', zeitaufwand:45, is_preset:true,
 zutaten:[{menge:'1,5',einheit:'kg',zutat:'Blütenhonig'},{menge:'2,5',einheit:'L',zutat:'Wasser (chlorfrei)'},{menge:'1',einheit:'L',zutat:'naturtrüber Apfelsaft'},{menge:'1',einheit:'Pck',zutat:'Weinhefe (Reinzuchthefe)'},{menge:'3',einheit:'g',zutat:'Hefenährsalz'},{menge:'15',einheit:'ml',zutat:'Milchsäure (80%)'}],
 schritte:['Honig in lauwarmem Wasser (max. 40°C) auflösen. Apfelsaft und Milchsäure hinzufügen.','Hefe laut Packungsanleitung aktivieren und zum Honigwasser geben. Hefenährsalz einrühren.','In einen Gärballon füllen und Gärröhrchen aufsetzen.','3–6 Wochen bei 20–25°C gären lassen, bis keine Blasen mehr aufsteigen. Unter 20°C kann die Gärung ins Stocken geraten.','Vom Bodensatz abziehen (umschlauchen) und mindestens 3–6 Monate reifen lassen. Met wird mit der Zeit deutlich besser.','In Flaschen abfüllen. Tipp: Geduld lohnt sich – nach 6–12 Monaten Reife schmeckt der Met am besten.']},

{id:'p4', kategorie:'essen', titel:'Honig-Nuss-Müsli (Granola)', beschreibung:'Knuspriges Granola mit Honig und gemischten Nüssen – selbstgemacht und ohne Industriezucker.', schwierigkeit:'leicht', zeitaufwand:35, is_preset:true,
 zutaten:[{menge:'300',einheit:'g',zutat:'Haferflocken'},{menge:'100',einheit:'g',zutat:'Honig'},{menge:'80',einheit:'g',zutat:'gemischte Nüsse'},{menge:'75',einheit:'g',zutat:'Kokosöl'},{menge:'50',einheit:'g',zutat:'Rosinen'},{menge:'1',einheit:'TL',zutat:'Vanilleextrakt'},{menge:'0,5',einheit:'TL',zutat:'Salz'}],
 schritte:['Backofen auf 160°C Ober-/Unterhitze vorheizen.','Kokosöl und Honig sanft erwärmen.','Haferflocken, grob gehackte Nüsse und Salz in einer Schüssel mischen.','Honig-Öl-Mischung und Vanille dazugeben, gut vermengen.','Auf einem Backblech verteilen. Nach 10 Min. einmal wenden, dann weitere 10–15 Min. backen.','Vollständig abkühlen lassen (erst dann wird es knusprig!), Rosinen untermischen. Luftdicht lagern.']},

{id:'p5', kategorie:'essen', titel:'Honig-Ingwer-Tee', beschreibung:'Wärmender Tee mit frischem Ingwer und Honig – ideal im Winter. Honig erst unter 40°C einrühren!', schwierigkeit:'leicht', zeitaufwand:15, is_preset:true,
 zutaten:[{menge:'1',einheit:'Stück',zutat:'Ingwer (daumengroß)'},{menge:'2',einheit:'EL',zutat:'Honig'},{menge:'500',einheit:'ml',zutat:'heißes Wasser'},{menge:'1',einheit:'',zutat:'Zitrone (Saft)'}],
 schritte:['Ingwer schälen und in dünne Scheiben schneiden (oder reiben für intensiveren Geschmack).','Mit heißem Wasser (nicht kochend!) übergießen und 8–10 Minuten ziehen lassen.','Auf Trinktemperatur abkühlen lassen (unter 40°C).','Erst dann Honig und Zitronensaft einrühren – so bleiben die wertvollen Enzyme erhalten.','Wichtig: Honig nie in kochendes Wasser geben – ab 40°C beginnen die Enzyme zu denaturieren!']},

{id:'p6', kategorie:'kosmetik', titel:'Honig-Lippenbalsam', beschreibung:'Natürlicher Lippenbalsam mit Bienenwachs und Honig. Zügig arbeiten – Bienenwachs erstarrt unter 62°C!', schwierigkeit:'mittel', zeitaufwand:20, is_preset:true,
 zutaten:[{menge:'10',einheit:'g',zutat:'Bienenwachs'},{menge:'20',einheit:'g',zutat:'Kokosöl'},{menge:'5',einheit:'g',zutat:'Honig'},{menge:'5',einheit:'Tropfen',zutat:'Vitamin-E-Öl'},{menge:'3',einheit:'Tropfen',zutat:'ätherisches Öl (optional)'}],
 schritte:['Bienenwachs und Kokosöl im Wasserbad bei ca. 65°C schmelzen.','Vom Herd nehmen und sofort bei ca. 60°C den Honig und das Vitamin-E-Öl unter ständigem Rühren einrühren.','Ätherisches Öl erst bei ca. 50°C hinzufügen (verdampft sonst).','Zügig in kleine Dosen oder Lippenpflege-Hülsen füllen – Bienenwachs erstarrt unter 62°C!','Vollständig aushärten lassen (ca. 1 Stunde). Kühl und trocken lagern, nie mit nassen Fingern entnehmen. Hält sich 3–6 Monate.']},

{id:'p7', kategorie:'kosmetik', titel:'Honig-Gesichtsmaske', beschreibung:'Feuchtigkeitsspendende Gesichtsmaske mit Kurkuma. Achtung: Kurkuma kann die Haut vorübergehend gelb färben!', schwierigkeit:'leicht', zeitaufwand:20, is_preset:true,
 zutaten:[{menge:'2',einheit:'EL',zutat:'Honig'},{menge:'1',einheit:'EL',zutat:'Naturjoghurt'},{menge:'1/4',einheit:'TL',zutat:'Kurkuma'}],
 schritte:['Alle Zutaten in einer kleinen Schüssel glatt rühren.','Auf das gereinigte Gesicht auftragen (Augenpartie aussparen). Handschuhe oder Pinsel verwenden!','10–15 Minuten einwirken lassen.','Mit lauwarmem Wasser abspülen und eine Feuchtigkeitscreme auftragen.','Hinweis: Kurkuma kann die Haut vorübergehend gelb färben – am besten abends anwenden. Reste mit Olivenöl oder Apfelessig-Wasser entfernen.']},

{id:'p8', kategorie:'kosmetik', titel:'Honig-Olivenöl-Haarkur', beschreibung:'Natürliche Haarkur für glänzendes Haar. Olivenöl ist die Hauptzutat, Honig nur in kleiner Menge.', schwierigkeit:'leicht', zeitaufwand:30, is_preset:true,
 zutaten:[{menge:'3',einheit:'EL',zutat:'Olivenöl'},{menge:'1',einheit:'TL',zutat:'Honig'},{menge:'1',einheit:'',zutat:'Eigelb'}],
 schritte:['Honig leicht erwärmen (nicht über 40°C), bis er flüssig wird.','Olivenöl und Eigelb unterrühren.','In das feuchte Haar einmassieren, besonders in die Spitzen.','Mit einem Handtuch umwickeln und 20 Minuten einwirken lassen.','Nur mit lauwarmem Wasser ausspülen – bei heißem Wasser gerinnt das Ei im Haar! Danach 2x mit Shampoo waschen.']},

{id:'p9', kategorie:'kosmetik', titel:'Propolis-Salbe', beschreibung:'Heilsame Salbe mit Propolis. Allergietest vor Erstanwendung durchführen! Propolis kann Hautreaktionen auslösen.', schwierigkeit:'mittel', zeitaufwand:45, is_preset:true,
 zutaten:[{menge:'12',einheit:'g',zutat:'Bienenwachs'},{menge:'80',einheit:'ml',zutat:'Olivenöl'},{menge:'8',einheit:'ml',zutat:'Propolis-Tinktur (20%)'},{menge:'5',einheit:'Tropfen',zutat:'Vitamin-E-Öl'}],
 schritte:['Tiegel mit 70% Alkohol desinfizieren.','Bienenwachs im Olivenöl im Wasserbad bei ca. 65°C langsam schmelzen.','Vom Wasserbad nehmen und auf ca. 45–50°C abkühlen lassen. Erst dann die Propolis-Tinktur tropfenweise einrühren – bei höherer Temperatur können Wirkstoffe zerstört werden!','Vitamin-E-Öl hinzufügen und in die vorbereiteten Tiegel abfüllen.','Aushärten lassen. Kühl und dunkel lagern, hält ca. 12 Monate.','Wichtig: Vor erster Anwendung Propolis-Salbe an einer kleinen Hautstelle testen – Propolis kann allergische Reaktionen auslösen!']},

{id:'p10', kategorie:'kosmetik', titel:'Bienenwachs-Handcreme', beschreibung:'Reichhaltige Handcreme mit Bienenwachs. Enthält Lanolin als Emulgator für eine stabile Creme.', schwierigkeit:'mittel', zeitaufwand:30, is_preset:true,
 zutaten:[{menge:'10',einheit:'g',zutat:'Bienenwachs'},{menge:'50',einheit:'ml',zutat:'Mandelöl'},{menge:'5',einheit:'g',zutat:'Lanolin (Wollwachs, Emulgator)'},{menge:'30',einheit:'ml',zutat:'Rosenwasser'},{menge:'1',einheit:'TL',zutat:'Honig'},{menge:'5',einheit:'Tropfen',zutat:'Lavendelöl'}],
 schritte:['Bienenwachs, Lanolin und Mandelöl im Wasserbad auf ca. 70°C schmelzen.','In einem zweiten Gefäß Rosenwasser und Honig ebenfalls auf ca. 70°C erwärmen.','Die Rosenwasser-Mischung langsam in die Öl-Wachs-Mischung einrühren – Milchaufschäumer oder Mixer verwenden!','Weiterrühren bis die Masse abgekühlt und cremig ist. Lavendelöl erst bei ca. 30°C dazugeben.','In Tiegel füllen und abkühlen lassen.','Ohne Konservierung im Kühlschrank lagern und innerhalb von 2–3 Wochen aufbrauchen.']},

{id:'p11', kategorie:'hausmittel', titel:'Honig-Zwiebel-Hustensaft', beschreibung:'Bewährtes Hausmittel gegen Husten. Nicht für Kinder unter 1 Jahr (Botulismus-Risiko)!', schwierigkeit:'leicht', zeitaufwand:15, is_preset:true,
 zutaten:[{menge:'1',einheit:'',zutat:'große Zwiebel'},{menge:'3',einheit:'EL',zutat:'Honig'},{menge:'1',einheit:'',zutat:'Einmachglas'}],
 schritte:['Zwiebel schälen und in kleine Würfel schneiden.','Abwechselnd Zwiebelwürfel und Honig in das Glas schichten.','Mindestens 8–12 Stunden (am besten über Nacht) ziehen lassen.','Den entstandenen Sirup durch ein feines Sieb abseihen.','3x täglich je 1 EL einnehmen. Hält sich im Kühlschrank 3–5 Tage.','Wichtig: Nicht für Kinder unter 1 Jahr geeignet (Botulismus-Risiko durch Honig)! Alternativ Zucker verwenden.']},

{id:'p12', kategorie:'hausmittel', titel:'Honig-Quark-Wickel', beschreibung:'Kühlender Wickel bei leichtem Sonnenbrand, Insektenstichen oder Gelenkschmerzen.', schwierigkeit:'leicht', zeitaufwand:10, is_preset:true,
 zutaten:[{menge:'3',einheit:'EL',zutat:'Quark (kühlschrankkalt)'},{menge:'1',einheit:'EL',zutat:'Honig'},{menge:'1',einheit:'',zutat:'Baumwolltuch'},{menge:'1',einheit:'',zutat:'Schal oder Fixiertuch'}],
 schritte:['Quark und Honig glatt verrühren.','Die Mischung fingerdick auf ein Baumwolltuch streichen.','Tuch mit der bestrichenen Seite auf die Haut legen – der Quark muss direkten Hautkontakt haben!','Ränder einklappen und mit Schal oder Fixiertuch befestigen.','Abnehmen, sobald der Quark antrocknet und bröckelig wird (ca. 20–30 Min.). Nicht länger drauflassen!','Haut vorsichtig reinigen. Bei Bedarf wiederholen.']},

{id:'p13', kategorie:'hausmittel', titel:'Propolis-Tinktur', beschreibung:'Konzentrierte Propolis-Lösung. Allergietest vor Erstanwendung! Nicht für Schwangere, Stillende und Kinder unter 1 Jahr.', schwierigkeit:'mittel', zeitaufwand:20, is_preset:true,
 zutaten:[{menge:'30',einheit:'g',zutat:'Rohpropolis (gereinigt)'},{menge:'100',einheit:'ml',zutat:'Alkohol (70%, Apotheke)'},{menge:'1',einheit:'',zutat:'dunkle Flasche mit Pipette'}],
 schritte:['Rohpropolis im Gefrierschrank hart werden lassen, dann fein zerkleinern.','In eine dunkle Flasche füllen und mit Alkohol übergießen.','4–6 Wochen an einem dunklen, warmen Ort ziehen lassen. Täglich schütteln!','Durch einen Kaffeefilter oder feines Tuch abseihen.','In eine Pipettenflasche füllen. Hält sich jahrelang.','Dosierung: Einschleichend beginnen mit 2–3 Tropfen. Faustregel: max. 1 Tropfen pro 10 kg Körpergewicht, in Wasser verdünnt. Allergietest vorher am Handgelenk durchführen! Nicht für Schwangere, Stillende, Kinder unter 1 Jahr und bei Bienen-/Pollenallergie.']},

{id:'p14', kategorie:'hausmittel', titel:'Honig-Zimt bei Erkältung', beschreibung:'Wärmende Honig-Zimt-Paste. Pfeffer wirkt schleimlösend und fördert die Durchblutung. Nur Ceylon-Zimt verwenden!', schwierigkeit:'leicht', zeitaufwand:5, is_preset:true,
 zutaten:[{menge:'1',einheit:'EL',zutat:'Honig'},{menge:'1/4',einheit:'TL',zutat:'Ceylon-Zimt'},{menge:'1',einheit:'Prise',zutat:'schwarzer Pfeffer'}],
 schritte:['Honig und Zimt in einer kleinen Schale glatt verrühren.','Schwarzen Pfeffer dazugeben – Piperin wirkt schleimlösend, wärmend und entzündungshemmend.','Morgens 1 TL einnehmen, oder in lauwarmen Tee einrühren (unter 40°C, damit Honig-Enzyme erhalten bleiben).','Wichtig: Nur Ceylon-Zimt verwenden! Cassia-Zimt (billiger Supermarkt-Zimt) enthält ca. 200x mehr leberschädigendes Cumarin. Ceylon erkennt man an der feinen, mehrschichtigen Rindenstruktur.','Nicht für Kinder unter 1 Jahr (Botulismus-Risiko). Bei Einnahme von Blutverdünnern vorher Arzt fragen.']},

{id:'p15', kategorie:'hausmittel', titel:'Honigwasser am Morgen', beschreibung:'Einfaches Morgenritual – ein Glas Honigwasser unterstützt die Verdauung und liefert Antioxidantien. Nicht für Diabetiker und Kinder unter 1 Jahr!', schwierigkeit:'leicht', zeitaufwand:3, is_preset:true,
 zutaten:[{menge:'1',einheit:'Glas',zutat:'lauwarmes Wasser (250ml, 35–40°C)'},{menge:'1',einheit:'EL',zutat:'Honig'},{menge:'1',einheit:'Spritzer',zutat:'Zitronensaft (optional)'}],
 schritte:['Ein Glas lauwarmes Wasser vorbereiten (35–40°C, Badewasser-Temperatur – nicht heißer!).','Honig einrühren, bis er sich vollständig aufgelöst hat.','Optional einen Spritzer Zitronensaft hinzufügen.','Morgens auf nüchternen Magen trinken, 30 Min. vor dem Frühstück.','Honig wirkt als natürliches Präbiotikum und liefert Antioxidantien. Nicht geeignet für Diabetiker (Blutzucker!) und Kinder unter 1 Jahr (Botulismus-Risiko).']},

// === ESSEN ab p16 ===

{id:'p16', kategorie:'essen', titel:'Honig-Lebkuchen', beschreibung:'Klassische deutsche Weihnachtsleckerei mit aromatischem Honigteig und weihnachtlichen Gewürzen.', schwierigkeit:'mittel', zeitaufwand:90, is_preset:true,
 zutaten:[{menge:'250',einheit:'g',zutat:'Honig'},{menge:'100',einheit:'g',zutat:'Zucker'},{menge:'60',einheit:'g',zutat:'Butter'},{menge:'1',einheit:'',zutat:'Ei'},{menge:'350',einheit:'g',zutat:'Mehl'},{menge:'50',einheit:'g',zutat:'gemahlene Mandeln'},{menge:'1',einheit:'Pck',zutat:'Backpulver'},{menge:'1',einheit:'TL',zutat:'Zimt'},{menge:'0,5',einheit:'TL',zutat:'gemahlene Nelken'},{menge:'0,5',einheit:'TL',zutat:'gemahlener Kardamom'},{menge:'0,5',einheit:'TL',zutat:'gemahlener Ingwer'},{menge:'50',einheit:'g',zutat:'Zitronat'},{menge:'50',einheit:'g',zutat:'Orangeat'},{menge:'1',einheit:'Prise',zutat:'Salz'}],
 schritte:['Honig, Zucker und Butter bei niedriger Hitze schmelzen und abkühlen lassen.','Mehl mit Backpulver, Gewürzen und Mandeln mischen.','Ei zur abgekühlten Honigmasse geben und verrühren.','Mehlmischung, Zitronat und Orangeat unterkneten.','Teig in Folie wickeln und mindestens 2 Stunden kühlen.','Ca. 1 cm dick ausrollen und Formen ausstechen.','Bei 180°C Ober-/Unterhitze ca. 12–15 Minuten backen.','Nach Belieben mit Zuckerguss oder Schokolade verzieren.']},

{id:'p17', kategorie:'essen', titel:'Honig-Baklava', beschreibung:'Orientalisches Blätterteig-Gebäck mit Nussfüllung und aromatischem Honigsirup.', schwierigkeit:'fortgeschritten', zeitaufwand:75, is_preset:true,
 zutaten:[{menge:'1',einheit:'Pck',zutat:'Filoteig (ca. 400g)'},{menge:'160',einheit:'g',zutat:'Walnusskerne'},{menge:'150',einheit:'g',zutat:'Pistazien (gehackt)'},{menge:'75',einheit:'g',zutat:'gemahlene Mandeln'},{menge:'250',einheit:'g',zutat:'Butter (geschmolzen)'},{menge:'4',einheit:'EL',zutat:'Zucker'},{menge:'1',einheit:'TL',zutat:'Zimt'},{menge:'125',einheit:'g',zutat:'Honig'},{menge:'140',einheit:'g',zutat:'Zucker (Sirup)'},{menge:'150',einheit:'ml',zutat:'Wasser'},{menge:'1',einheit:'EL',zutat:'Zitronensaft'}],
 schritte:['Backofen auf 200°C vorheizen.','Walnüsse fein hacken, mit Pistazien, Mandeln, Zimt und 4 EL Zucker mischen.','Hälfte der Filoteigblätter einzeln in gefettete Form legen, jedes mit Butter bestreichen.','Nussmischung verteilen. Restliche Blätter darauf, jedes mit Butter bestreichen.','In Rauten schneiden. Ca. 25 Min. goldbraun backen.','Sirup: Wasser, Zucker und Honig aufkochen, Zitronensaft dazu, 10 Min. einkochen.','Heißen Sirup über das gebackene Baklava gießen und vollständig auskühlen lassen.']},

{id:'p18', kategorie:'essen', titel:'Honig-Lachs aus dem Ofen', beschreibung:'Saftiges Lachsfilet mit aromatischer Honig-Knoblauch-Glasur.', schwierigkeit:'leicht', zeitaufwand:30, is_preset:true,
 zutaten:[{menge:'4',einheit:'',zutat:'Lachsfilets (je ca. 200g)'},{menge:'55',einheit:'g',zutat:'Honig'},{menge:'3',einheit:'',zutat:'Knoblauchzehen'},{menge:'1',einheit:'EL',zutat:'frischer Thymian'},{menge:'1',einheit:'EL',zutat:'Olivenöl'},{menge:'1',einheit:'EL',zutat:'Zitronensaft'},{menge:'',einheit:'',zutat:'Salz und Pfeffer'}],
 schritte:['Backofen auf 170°C vorheizen.','Honig, Thymian, Zitronensaft, Olivenöl und gepressten Knoblauch mit Salz und Pfeffer verrühren.','Lachsfilets auf Backpapier legen und großzügig mit der Glasur bestreichen.','15–18 Minuten garen. Nach der Hälfte nochmals glasieren.','Mit Zitronenspalten und frischen Kräutern servieren.']},

{id:'p19', kategorie:'essen', titel:'Bienenstich', beschreibung:'Klassischer deutscher Hefekuchen mit knuspriger Mandel-Honig-Kruste und Vanillecreme.', schwierigkeit:'fortgeschritten', zeitaufwand:120, is_preset:true,
 zutaten:[{menge:'500',einheit:'g',zutat:'Mehl'},{menge:'1',einheit:'Pck',zutat:'Trockenhefe'},{menge:'75',einheit:'g',zutat:'Zucker'},{menge:'1',einheit:'Prise',zutat:'Salz'},{menge:'200',einheit:'ml',zutat:'lauwarme Milch'},{menge:'75',einheit:'g',zutat:'weiche Butter (Teig)'},{menge:'1',einheit:'',zutat:'Ei'},{menge:'100',einheit:'g',zutat:'Butter (Belag)'},{menge:'100',einheit:'g',zutat:'Zucker (Belag)'},{menge:'3',einheit:'EL',zutat:'Honig'},{menge:'2',einheit:'EL',zutat:'Sahne (Belag)'},{menge:'200',einheit:'g',zutat:'gehobelte Mandeln'},{menge:'500',einheit:'ml',zutat:'Milch (Füllung)'},{menge:'1',einheit:'Pck',zutat:'Vanillepuddingpulver'},{menge:'2',einheit:'EL',zutat:'Zucker (Füllung)'},{menge:'200',einheit:'ml',zutat:'Schlagsahne'}],
 schritte:['Hefeteig aus Mehl, Hefe, Zucker, Salz, Milch, Butter und Ei kneten. 45 Min. gehen lassen.','Belag: Butter, Zucker, Honig und Sahne aufkochen, Mandeln einrühren, abkühlen.','Teig auf gefettetem Blech ausrollen, 15 Min. gehen lassen.','Mandelmasse verteilen. Bei 180°C ca. 20–25 Min. goldbraun backen.','Pudding kochen und abkühlen lassen. Sahne steif schlagen und unterheben.','Kuchen halbieren, Creme einfüllen, Deckel aufsetzen.']},

{id:'p20', kategorie:'essen', titel:'Honig-Senf-Hähnchen', beschreibung:'Zartes Hähnchen in cremiger Honig-Senf-Sauce mit Sahne und Thymian.', schwierigkeit:'leicht', zeitaufwand:35, is_preset:true,
 zutaten:[{menge:'4',einheit:'',zutat:'Hähnchenbrustfilets'},{menge:'3',einheit:'EL',zutat:'Honig'},{menge:'3',einheit:'EL',zutat:'mittelscharfer Senf'},{menge:'1',einheit:'',zutat:'Zwiebel'},{menge:'2',einheit:'',zutat:'Knoblauchzehen'},{menge:'200',einheit:'ml',zutat:'Hühnerbrühe'},{menge:'200',einheit:'ml',zutat:'Sahne'},{menge:'2',einheit:'EL',zutat:'Olivenöl'},{menge:'1',einheit:'TL',zutat:'Thymian'},{menge:'',einheit:'',zutat:'Salz und Pfeffer'}],
 schritte:['Honig und Senf verrühren, Hähnchen damit 15 Min. marinieren.','Zwiebel und Knoblauch fein hacken.','Öl erhitzen, Hähnchen von beiden Seiten je 3–4 Min. goldbraun braten. Herausnehmen.','Zwiebel und Knoblauch glasig dünsten.','Mit Brühe ablöschen, Sahne und Thymian einrühren.','Hähnchen zurücklegen und 10–12 Min. köcheln. Mit Reis servieren.']},

{id:'p21', kategorie:'essen', titel:'Honig-Waffeln', beschreibung:'Fluffige Waffeln mit Honig statt Zucker nach Südtiroler Art.', schwierigkeit:'leicht', zeitaufwand:25, is_preset:true,
 zutaten:[{menge:'150',einheit:'g',zutat:'weiche Butter'},{menge:'4',einheit:'EL',zutat:'Honig'},{menge:'3',einheit:'',zutat:'Eier'},{menge:'250',einheit:'g',zutat:'Mehl'},{menge:'250',einheit:'ml',zutat:'Milch'},{menge:'1',einheit:'TL',zutat:'Natron'},{menge:'1',einheit:'Prise',zutat:'Salz'}],
 schritte:['Weiche Butter mit Honig cremig rühren.','Eier einzeln unterrühren.','Mehl mit Natron und Salz mischen und abwechselnd mit Milch unterrühren.','Waffeleisen vorheizen und leicht einfetten.','Pro Waffel ca. 2 EL Teig einfüllen und goldbraun backen.','Mit Früchten, Sahne oder Honig servieren.']},

{id:'p22', kategorie:'essen', titel:'Honig-Limonade', beschreibung:'Erfrischende selbstgemachte Limonade mit Honig als natürlichem Süßungsmittel.', schwierigkeit:'leicht', zeitaufwand:15, is_preset:true,
 zutaten:[{menge:'4',einheit:'',zutat:'Zitronen (Saft)'},{menge:'4',einheit:'EL',zutat:'Honig'},{menge:'1',einheit:'L',zutat:'kaltes Mineralwasser'},{menge:'1',einheit:'Handvoll',zutat:'frische Minzblätter'},{menge:'',einheit:'',zutat:'Eiswürfel'}],
 schritte:['Zitronen auspressen, Saft durch ein Sieb in eine Karaffe gießen.','Honig mit etwas warmem Wasser verrühren, bis er sich aufgelöst hat.','Honigwasser zum Zitronensaft geben und umrühren.','Mit kaltem Mineralwasser auffüllen.','Minzblätter leicht andrücken und dazugeben. Mit Eiswürfeln servieren.']},

{id:'p23', kategorie:'essen', titel:'Gebrannte Honig-Mandeln', beschreibung:'Knusprig karamellisierte Mandeln mit Honig und Vanille wie vom Weihnachtsmarkt.', schwierigkeit:'leicht', zeitaufwand:20, is_preset:true,
 zutaten:[{menge:'200',einheit:'g',zutat:'ganze Mandeln (ungeschält)'},{menge:'3',einheit:'EL',zutat:'Honig'},{menge:'2',einheit:'TL',zutat:'Kokosöl'},{menge:'1',einheit:'TL',zutat:'Zimt'},{menge:'1',einheit:'',zutat:'Vanilleschote (Mark)'},{menge:'1',einheit:'Prise',zutat:'Salz'}],
 schritte:['Backofen auf 160°C vorheizen.','Mandeln mit Vanillemark und Zimt mischen.','Honig und Kokosöl erwärmen, über die Mandeln gießen und vermengen.','Auf Backpapier verteilen. 15 Min. backen, nach 8 Min. wenden.','Mit Salz bestreuen und vollständig auskühlen lassen – erst dann knusprig!']},

{id:'p24', kategorie:'essen', titel:'Honigbutter', beschreibung:'Cremiger Brotaufstrich aus nur zwei Hauptzutaten, perfekt zum Frühstück.', schwierigkeit:'leicht', zeitaufwand:10, is_preset:true,
 zutaten:[{menge:'125',einheit:'g',zutat:'weiche Butter'},{menge:'3',einheit:'EL',zutat:'Honig'},{menge:'1',einheit:'Prise',zutat:'Salz'},{menge:'0,5',einheit:'TL',zutat:'Zimt (optional)'}],
 schritte:['Butter auf Zimmertemperatur bringen.','Mit dem Handmixer cremig aufschlagen.','Honig und Salz nach und nach einrühren. Optional Zimt unterrühren.','In ein Glas füllen. Im Kühlschrank ca. 7 Tage haltbar.']},

{id:'p25', kategorie:'essen', titel:'Honig-Balsamico-Dressing', beschreibung:'Feines Salatdressing mit süßem Honig und würzigem Balsamico.', schwierigkeit:'leicht', zeitaufwand:5, is_preset:true,
 zutaten:[{menge:'90',einheit:'ml',zutat:'Olivenöl'},{menge:'30',einheit:'ml',zutat:'Balsamico-Essig'},{menge:'10',einheit:'g',zutat:'Honig'},{menge:'15',einheit:'g',zutat:'Dijon-Senf'},{menge:'',einheit:'',zutat:'Salz, Pfeffer'}],
 schritte:['Balsamico, Honig und Senf mit einem Schneebesen glatt verrühren.','Olivenöl in dünnem Strahl unter ständigem Rühren einlaufen lassen.','Mit Salz und Pfeffer abschmecken. Bis zu 7 Tage im Kühlschrank haltbar.']},

{id:'p26', kategorie:'essen', titel:'Honig-Karamell-Bonbons', beschreibung:'Selbstgemachte Karamellbonbons mit Honig – perfekt als Geschenk aus der Küche.', schwierigkeit:'mittel', zeitaufwand:45, is_preset:true,
 zutaten:[{menge:'450',einheit:'g',zutat:'Zucker'},{menge:'3',einheit:'EL',zutat:'Honig'},{menge:'60',einheit:'g',zutat:'Butter'},{menge:'8',einheit:'EL',zutat:'Schlagsahne'},{menge:'4',einheit:'EL',zutat:'Wasser'},{menge:'1',einheit:'Prise',zutat:'Salz'}],
 schritte:['Backblech mit Backpapier auslegen und einfetten.','Zucker, Honig, Butter, Sahne und Wasser bei mittlerer Hitze unter Rühren erwärmen.','Nach dem Auflösen Temperatur erhöhen und aufkochen.','15–18 Min. köcheln bis goldbraun (ca. 150°C mit Zuckerthermometer).','Auf das Backpapier gießen. Noch warm in Stücke schneiden.','Auskühlen lassen und in Zellophan einwickeln.']},

{id:'p27', kategorie:'essen', titel:'Honig-Pancakes', beschreibung:'Fluffige Pfannkuchen mit Honig und steifem Eischnee für extra Luftigkeit.', schwierigkeit:'leicht', zeitaufwand:25, is_preset:true,
 zutaten:[{menge:'200',einheit:'g',zutat:'Mehl'},{menge:'2',einheit:'TL',zutat:'Backpulver'},{menge:'2',einheit:'',zutat:'Eier (getrennt)'},{menge:'200',einheit:'ml',zutat:'Milch'},{menge:'2',einheit:'EL',zutat:'Honig'},{menge:'30',einheit:'g',zutat:'geschmolzene Butter'},{menge:'1',einheit:'Prise',zutat:'Salz'}],
 schritte:['Eigelbe mit Milch, Honig und Butter verrühren.','Mehl und Backpulver unterheben. 15 Min. ruhen lassen.','Eiweiße mit Salz steif schlagen und vorsichtig unterheben.','In gebutteter Pfanne bei mittlerer Hitze kleine Pancakes je 2 Min. pro Seite backen.','Mit Honig, Beeren oder Ahornsirup servieren.']},

{id:'p28', kategorie:'essen', titel:'Honig-Joghurt mit Nüssen', beschreibung:'Griechischer Joghurt mit Honig und Nüssen – schnelles gesundes Dessert.', schwierigkeit:'leicht', zeitaufwand:5, is_preset:true,
 zutaten:[{menge:'500',einheit:'g',zutat:'griechischer Joghurt'},{menge:'4',einheit:'EL',zutat:'Honig'},{menge:'50',einheit:'g',zutat:'Walnusskerne'},{menge:'2',einheit:'EL',zutat:'Haferflocken'},{menge:'1',einheit:'Pck',zutat:'Vanillezucker'}],
 schritte:['Joghurt mit Vanillezucker verrühren.','Walnüsse grob hacken.','Joghurt in 4 Schalen verteilen.','Je 1 EL Honig darüberträufeln. Mit Nüssen und Haferflocken bestreuen.']},

{id:'p29', kategorie:'essen', titel:'Möhren-Honig-Suppe', beschreibung:'Samtige Möhrencremesuppe mit Ingwer und Honig, gewürzt mit Kreuzkümmel.', schwierigkeit:'leicht', zeitaufwand:35, is_preset:true,
 zutaten:[{menge:'500',einheit:'g',zutat:'Möhren'},{menge:'1',einheit:'',zutat:'Zwiebel'},{menge:'2',einheit:'',zutat:'Knoblauchzehen'},{menge:'1',einheit:'Stück',zutat:'Ingwer (3cm)'},{menge:'1',einheit:'',zutat:'Kartoffel (mehlig)'},{menge:'750',einheit:'ml',zutat:'Gemüsebrühe'},{menge:'2',einheit:'EL',zutat:'Honig'},{menge:'2',einheit:'EL',zutat:'Olivenöl'},{menge:'1',einheit:'TL',zutat:'Kreuzkümmel'},{menge:'2',einheit:'EL',zutat:'Crème fraîche'}],
 schritte:['Möhren und Kartoffel schälen und würfeln. Zwiebel, Knoblauch und Ingwer fein hacken.','In Olivenöl 3 Min. anschwitzen. Kreuzkümmel einrühren.','Gemüse dazu, mit Brühe aufgießen. 20 Min. köcheln.','Honig einrühren und fein pürieren. Mit Salz und Pfeffer abschmecken.','Mit Crème fraîche servieren.']},

{id:'p30', kategorie:'essen', titel:'Honig-Nuss-Riegel', beschreibung:'Selbstgemachte Müsliriegel mit Honig als gesunder Snack für unterwegs.', schwierigkeit:'leicht', zeitaufwand:40, is_preset:true,
 zutaten:[{menge:'150',einheit:'g',zutat:'Haferflocken'},{menge:'80',einheit:'g',zutat:'gemischte Nüsse'},{menge:'50',einheit:'g',zutat:'Trockenfrüchte'},{menge:'80',einheit:'g',zutat:'Honig'},{menge:'40',einheit:'g',zutat:'Butter'},{menge:'1',einheit:'EL',zutat:'Zitronensaft'},{menge:'1',einheit:'Prise',zutat:'Salz'}],
 schritte:['Backofen auf 170°C vorheizen. Nüsse hacken, Haferflocken anrösten.','Honig mit Butter schmelzen, Zitronensaft einrühren.','Alles mit Trockenfrüchten und Salz mischen.','In eine mit Backpapier ausgelegte Form (20x20cm) fest drücken.','Ca. 20 Min. goldbraun backen. Noch warm in Riegel schneiden.']},

{id:'p31', kategorie:'essen', titel:'Honigwein-Punsch', beschreibung:'Wärmender Glühwein mit Honig und winterlichen Gewürzen.', schwierigkeit:'leicht', zeitaufwand:20, is_preset:true,
 zutaten:[{menge:'750',einheit:'ml',zutat:'Rotwein'},{menge:'100',einheit:'ml',zutat:'Orangensaft'},{menge:'4',einheit:'EL',zutat:'Honig'},{menge:'1',einheit:'',zutat:'Zimtstange'},{menge:'3',einheit:'',zutat:'Sternanis'},{menge:'4',einheit:'',zutat:'Nelken'},{menge:'1',einheit:'',zutat:'Orange (Bio, Scheiben)'}],
 schritte:['Rotwein und Orangensaft in einen Topf geben.','Gewürze und Orangenscheiben hinzufügen.','Langsam auf ca. 70°C erhitzen – nicht kochen (Alkohol erhalten!).','Honig einrühren. Zugedeckt 20 Min. ziehen lassen.','Gewürze entfernen und heiß servieren.']},

{id:'p32', kategorie:'essen', titel:'Honig-Eis', beschreibung:'Cremiges Honig-Eis mit griechischem Joghurt – auch ohne Eismaschine machbar.', schwierigkeit:'leicht', zeitaufwand:30, is_preset:true,
 zutaten:[{menge:'300',einheit:'g',zutat:'griechischer Joghurt'},{menge:'100',einheit:'g',zutat:'Kondensmilch'},{menge:'75',einheit:'g',zutat:'Honig'},{menge:'200',einheit:'ml',zutat:'Schlagsahne'},{menge:'1',einheit:'Prise',zutat:'Salz'}],
 schritte:['Joghurt, Kondensmilch, Honig und Salz glatt verrühren.','Sahne steif schlagen und vorsichtig unterheben.','In gefriergeeignete Form füllen. 4–6 Stunden gefrieren.','In den ersten 2 Stunden alle 30 Min. durchrühren (verhindert Kristalle).','10 Min. vor dem Servieren aus dem Gefrierfach nehmen.']},

{id:'p33', kategorie:'essen', titel:'Honig-Popcorn', beschreibung:'Süßes karamellisiertes Popcorn mit Honig und Meersalz.', schwierigkeit:'leicht', zeitaufwand:15, is_preset:true,
 zutaten:[{menge:'75',einheit:'g',zutat:'Popcorn-Mais'},{menge:'3',einheit:'EL',zutat:'Honig'},{menge:'30',einheit:'g',zutat:'Butter'},{menge:'2',einheit:'EL',zutat:'Zucker'},{menge:'2',einheit:'EL',zutat:'Pflanzenöl'},{menge:'1',einheit:'Prise',zutat:'Meersalz'}],
 schritte:['Öl im Topf erhitzen, Mais unter Schütteln aufpoppen lassen.','Popcorn in große Schüssel umfüllen.','Butter, Honig und Zucker bei niedriger Hitze 2–3 Min. karamellisieren.','Sofort über das Popcorn gießen und vermengen. Mit Meersalz bestreuen.','Auf einem Blech ausbreiten und auskühlen lassen.']},

{id:'p34', kategorie:'essen', titel:'Honig-Hefezopf', beschreibung:'Lockerer Hefezopf mit Honig gesüßt, ideal zum Sonntagsfrühstück.', schwierigkeit:'mittel', zeitaufwand:120, is_preset:true,
 zutaten:[{menge:'500',einheit:'g',zutat:'Mehl'},{menge:'1',einheit:'Pck',zutat:'Trockenhefe'},{menge:'200',einheit:'ml',zutat:'lauwarme Milch'},{menge:'80',einheit:'g',zutat:'Honig'},{menge:'80',einheit:'g',zutat:'weiche Butter'},{menge:'1',einheit:'',zutat:'Ei'},{menge:'1',einheit:'TL',zutat:'Salz'},{menge:'1',einheit:'',zutat:'Eigelb + 2 EL Milch (Glasur)'},{menge:'2',einheit:'EL',zutat:'Hagelzucker'}],
 schritte:['Milch erwärmen, Honig und Butter darin auflösen.','Mehl, Hefe und Salz mischen. Honig-Milch und Ei dazu, 10 Min. kneten.','60 Min. abgedeckt gehen lassen.','In 3 Stücke teilen, zu Strängen rollen und flechten.','30 Min. zugedeckt gehen lassen.','Mit Eigelb-Milch bestreichen, Hagelzucker darauf.','Bei 180°C ca. 25–30 Min. goldbraun backen.']},

{id:'p35', kategorie:'essen', titel:'Honig-Marinade fürs Grillen', beschreibung:'Würzige Honig-Senf-Marinade mit Sojasauce für Hähnchen, Rind oder Schwein.', schwierigkeit:'leicht', zeitaufwand:10, is_preset:true,
 zutaten:[{menge:'3',einheit:'EL',zutat:'Honig'},{menge:'3',einheit:'EL',zutat:'Sojasauce'},{menge:'2',einheit:'EL',zutat:'Senf'},{menge:'2',einheit:'EL',zutat:'Olivenöl'},{menge:'2',einheit:'',zutat:'Knoblauchzehen'},{menge:'1',einheit:'TL',zutat:'Paprikapulver'},{menge:'',einheit:'',zutat:'schwarzer Pfeffer'}],
 schritte:['Knoblauch fein pressen.','Alle Zutaten in einer Schüssel verrühren.','Fleisch (ca. 800g) großzügig einreiben.','Mind. 2 Stunden, idealerweise über Nacht marinieren.','30 Min. vor dem Grillen auf Raumtemperatur bringen.']},

{id:'p36', kategorie:'essen', titel:'Warme Honig-Milch', beschreibung:'Beruhigender Schlummertrunk mit Honig, Zimt und Vanille.', schwierigkeit:'leicht', zeitaufwand:5, is_preset:true,
 zutaten:[{menge:'500',einheit:'ml',zutat:'Vollmilch'},{menge:'2',einheit:'TL',zutat:'Honig'},{menge:'1',einheit:'Prise',zutat:'Zimt'},{menge:'1',einheit:'Prise',zutat:'Muskatnuss'},{menge:'0,5',einheit:'TL',zutat:'Vanilleextrakt (optional)'}],
 schritte:['Milch langsam auf max. 40°C erwärmen – nicht kochen!','Vom Herd nehmen. Honig einrühren.','Zimt, Muskatnuss und Vanille dazugeben. Warm genießen.']},

{id:'p37', kategorie:'essen', titel:'Oxymel (Honig-Essig-Elixier)', beschreibung:'Traditionelles Stärkungsmittel aus Honig und Apfelessig mit Kräutern. Hält sich ca. 1 Jahr.', schwierigkeit:'leicht', zeitaufwand:20, is_preset:true,
 zutaten:[{menge:'300',einheit:'g',zutat:'Blütenhonig (bio)'},{menge:'100',einheit:'ml',zutat:'naturtrüber Apfelessig'},{menge:'30',einheit:'g',zutat:'frische Kräuter (Thymian, Salbei, Rosmarin)'}],
 schritte:['Kräuter waschen, trockentupfen und fein hacken.','Honig und Apfelessig im Verhältnis 3:1 in ein abgekochtes Glas geben.','Kräuter untermischen. Glas verschließen.','4 Wochen an dunklem, kühlem Ort ziehen lassen. Täglich schütteln.','Durch ein feines Sieb abseihen. Täglich 1 EL pur oder in Wasser. Ca. 1 Jahr haltbar.']},

{id:'p38', kategorie:'essen', titel:'Honig-Glasur für Rippchen', beschreibung:'Süß-scharfe Honigglasur für saftige Schweinerippchen aus dem Ofen.', schwierigkeit:'mittel', zeitaufwand:90, is_preset:true,
 zutaten:[{menge:'1',einheit:'kg',zutat:'Schweinerippchen'},{menge:'100',einheit:'g',zutat:'Honig'},{menge:'3',einheit:'EL',zutat:'Sojasauce'},{menge:'1',einheit:'TL',zutat:'Chiliflocken'},{menge:'2',einheit:'',zutat:'Knoblauchzehen'},{menge:'1',einheit:'EL',zutat:'Tomatenmark'},{menge:'2',einheit:'EL',zutat:'Olivenöl'}],
 schritte:['Rippchen mit Salz und Pfeffer würzen. Bei 160°C mit Alufolie 45 Min. vorgaren.','Glasur: Honig, Sojasauce, Chiliflocken, Knoblauch, Tomatenmark und Olivenöl verrühren.','Folie entfernen, großzügig glasieren.','Temperatur auf 200°C erhöhen, 25–30 Min. weitergaren. Alle 10 Min. nachglasieren.']},

{id:'p39', kategorie:'essen', titel:'Honig-Pralinen', beschreibung:'Edle Schokoladen-Honig-Pralinen mit Butter und optionalem Rum.', schwierigkeit:'mittel', zeitaufwand:60, is_preset:true,
 zutaten:[{menge:'200',einheit:'g',zutat:'Zartbitterkuvertüre'},{menge:'3',einheit:'EL',zutat:'Honig'},{menge:'50',einheit:'g',zutat:'Butter'},{menge:'100',einheit:'ml',zutat:'Sahne'},{menge:'1',einheit:'EL',zutat:'Rum (optional)'},{menge:'2',einheit:'EL',zutat:'Kakaopulver'},{menge:'50',einheit:'g',zutat:'Pistazien (gehackt)'}],
 schritte:['150g Kuvertüre fein hacken. Sahne aufkochen und darübergießen. 1 Min. stehen lassen, dann glatt rühren.','Honig und Butter einrühren. Optional Rum dazu.','Ganache 2 Stunden im Kühlschrank fest werden lassen.','Kleine Kugeln formen.','Rest-Kuvertüre schmelzen und Kugeln darin wenden oder in Kakaopulver rollen.','Mit Pistazien dekorieren. Im Kühlschrank aufbewahren.']},

{id:'p40', kategorie:'essen', titel:'Honig-Sesam-Hähnchen', beschreibung:'Asiatisch inspiriertes Hähnchen mit Honig-Sojasauce und geröstetem Sesam.', schwierigkeit:'mittel', zeitaufwand:30, is_preset:true,
 zutaten:[{menge:'500',einheit:'g',zutat:'Hähnchenbrust'},{menge:'3',einheit:'EL',zutat:'Honig'},{menge:'3',einheit:'EL',zutat:'Sojasauce'},{menge:'1',einheit:'EL',zutat:'Reisessig'},{menge:'1',einheit:'EL',zutat:'Sesamöl'},{menge:'2',einheit:'EL',zutat:'Speisestärke'},{menge:'1',einheit:'',zutat:'Knoblauchzehe'},{menge:'1',einheit:'TL',zutat:'geriebener Ingwer'},{menge:'2',einheit:'EL',zutat:'weißer Sesam'},{menge:'2',einheit:'EL',zutat:'Pflanzenöl'}],
 schritte:['Hähnchen in Stücke schneiden, mit Speisestärke, Salz und Pfeffer bestäuben.','Sauce: Honig, Sojasauce, Reisessig und Sesamöl verrühren.','Öl in Wok stark erhitzen. Hähnchen 5–6 Min. knusprig braten.','Knoblauch und Ingwer kurz mitbraten. Sauce dazugießen, 2–3 Min. einkochen.','Sesam trocken rösten und darüberstreuen. Mit Reis servieren.']},

// =============================================
// KOSMETIK & PFLEGE (ab p41)
// =============================================

{id:'p41', kategorie:'kosmetik', titel:'Honig-Salz-Peeling', beschreibung:'Natürliches Körperpeeling mit Honig und Meersalz – entfernt abgestorbene Hautzellen sanft.', schwierigkeit:'leicht', zeitaufwand:10, is_preset:true,
 zutaten:[{menge:'4',einheit:'EL',zutat:'Honig'},{menge:'2',einheit:'EL',zutat:'feines Meersalz'},{menge:'1',einheit:'EL',zutat:'Olivenöl'}],
 schritte:['Honig leicht erwärmen. Meersalz und Olivenöl einrühren.','Auf angefeuchtete Haut auftragen, in kreisenden Bewegungen einmassieren.','5 Min. einmassieren, dann mit lauwarmem Wasser abspülen.','Für das Gesicht nur sehr feinkörniges Salz verwenden. Immer frisch zubereiten.']},

{id:'p42', kategorie:'kosmetik', titel:'Bienenwachs-Bartbalsam', beschreibung:'Pflegender Bartbalsam mit Bienenwachs und Sheabutter – gibt Halt und pflegt.', schwierigkeit:'mittel', zeitaufwand:30, is_preset:true,
 zutaten:[{menge:'10',einheit:'g',zutat:'Bienenwachs'},{menge:'10',einheit:'g',zutat:'Sheabutter'},{menge:'5',einheit:'g',zutat:'Lanolin'},{menge:'5',einheit:'ml',zutat:'Jojobaöl'},{menge:'3',einheit:'Tropfen',zutat:'ätherisches Zedernholzöl'}],
 schritte:['Wachs, Sheabutter und Lanolin im Wasserbad bei ca. 65°C schmelzen.','Jojobaöl unterrühren. Ätherisches Öl dazu.','Zügig in einen Tiegel (30ml) abfüllen – Wachs erstarrt unter 62°C.','1 Stunde im Kühlschrank aushärten lassen. Haltbarkeit: ca. 6 Monate.']},

{id:'p43', kategorie:'kosmetik', titel:'Propolis-Mundwasser', beschreibung:'Antibakterielles Mundwasser mit Propolis. Allergietest vorher durchführen!', schwierigkeit:'leicht', zeitaufwand:5, is_preset:true,
 zutaten:[{menge:'200',einheit:'ml',zutat:'abgekochtes Wasser (abgekühlt)'},{menge:'15',einheit:'Tropfen',zutat:'Propolis-Tinktur (10–20%)'},{menge:'2',einheit:'Tropfen',zutat:'Teebaumöl'},{menge:'2',einheit:'Tropfen',zutat:'Pfefferminzöl'}],
 schritte:['Abgekochtes Wasser abkühlen lassen. Propolis-Tinktur, Teebaumöl und Pfefferminzöl hinzufügen.','Vor jeder Anwendung gut schütteln. 1 EL als Mundspülung, 30 Sek. spülen, ausspucken.','Allergietest vorher auf der Haut durchführen! Innerhalb 2 Wochen aufbrauchen.']},

{id:'p44', kategorie:'kosmetik', titel:'Kleopatra-Milchbad', beschreibung:'Luxuriöses Milch-Honig-Bad – macht die Haut streichelzart.', schwierigkeit:'leicht', zeitaufwand:15, is_preset:true,
 zutaten:[{menge:'1',einheit:'Liter',zutat:'Vollmilch'},{menge:'3',einheit:'EL',zutat:'Honig'},{menge:'2',einheit:'EL',zutat:'Olivenöl'},{menge:'5',einheit:'Tropfen',zutat:'ätherisches Lavendelöl (optional)'}],
 schritte:['Milch auf ca. 40°C erwärmen. Honig darin auflösen.','Olivenöl und ätherisches Öl unterrühren.','Ins einlaufende Badewasser (37–38°C) geben.','Ca. 20 Min. entspannen. Danach nur leicht abtupfen.']},

{id:'p45', kategorie:'kosmetik', titel:'Bienenwachstücher (DIY)', beschreibung:'Nachhaltige Wachstücher als Frischhaltefolien-Ersatz aus Baumwollstoff und Bienenwachs.', schwierigkeit:'leicht', zeitaufwand:30, is_preset:true,
 zutaten:[{menge:'20',einheit:'g',zutat:'Bienenwachs-Pastillen pro Tuch'},{menge:'1',einheit:'',zutat:'Baumwollstoff (25x25cm, 100% Baumwolle)'},{menge:'2',einheit:'Bogen',zutat:'Backpapier'}],
 schritte:['Backofen auf 85°C vorheizen.','Stoff auf Backpapier legen, Wachspastillen darauf verteilen.','Zweiten Bogen Backpapier darüber. 5 Min. im Ofen bis Wachs geschmolzen.','Alternativ: Mit Bügeleisen über Backpapier verteilen.','Zum Trocknen aufhängen. Pflege: Mit kaltem Wasser und Spülmittel reinigen. Nicht in Mikrowelle/Spülmaschine.']},

{id:'p46', kategorie:'kosmetik', titel:'Propolis-Zahnpasta', beschreibung:'Natürliche Zahnpasta mit Kokosöl, Natron und Propolis. Allergietest vorher!', schwierigkeit:'mittel', zeitaufwand:15, is_preset:true,
 zutaten:[{menge:'3',einheit:'EL',zutat:'Kokosöl (nativ)'},{menge:'2',einheit:'EL',zutat:'Natron'},{menge:'1',einheit:'TL',zutat:'Xylit (Birkenzucker)'},{menge:'10',einheit:'Tropfen',zutat:'Propolis-Tinktur (10–20%)'},{menge:'5',einheit:'Tropfen',zutat:'Pfefferminzöl'}],
 schritte:['Kokosöl im Wasserbad schmelzen. Natron und Xylit einrühren.','Etwas abkühlen lassen, dann Propolis-Tinktur und Pfefferminzöl einrühren.','In ein sauberes Schraubglas füllen.','Erbsengroße Menge auf die Zahnbürste. Allergietest vorher! Haltbarkeit ca. 3 Monate.']},

{id:'p47', kategorie:'kosmetik', titel:'Honig-Badebomben', beschreibung:'Sprudelnde Badekugeln mit Honig – ein Verwöhn-Erlebnis.', schwierigkeit:'mittel', zeitaufwand:45, is_preset:true,
 zutaten:[{menge:'200',einheit:'g',zutat:'Natron'},{menge:'100',einheit:'g',zutat:'Zitronensäure'},{menge:'50',einheit:'g',zutat:'Speisestärke'},{menge:'2',einheit:'EL',zutat:'Kokosöl (geschmolzen)'},{menge:'1',einheit:'EL',zutat:'Honig'},{menge:'5',einheit:'Tropfen',zutat:'ätherisches Öl (z.B. Orange)'}],
 schritte:['Natron, Zitronensäure und Stärke trocken mischen.','Kokosöl und Honig verrühren. Tropfenweise(!) zur trockenen Mischung geben.','Ätherisches Öl dazu. Masse soll wie feuchter Sand zusammenhalten.','In Silikonformen fest drücken. 24 Stunden trocknen lassen.','Trocken und luftdicht lagern.']},

{id:'p48', kategorie:'kosmetik', titel:'Bienenwachs-Bodylotion', beschreibung:'Pflegende Körperlotion mit Emulsan als Emulgator. Ohne Konservierung nur 2–3 Wochen haltbar!', schwierigkeit:'fortgeschritten', zeitaufwand:40, is_preset:true,
 zutaten:[{menge:'8',einheit:'g',zutat:'Bienenwachs'},{menge:'5',einheit:'g',zutat:'Emulsan (Emulgator)'},{menge:'30',einheit:'ml',zutat:'Mandelöl'},{menge:'60',einheit:'ml',zutat:'Rosenwasser'},{menge:'5',einheit:'Tropfen',zutat:'ätherisches Lavendelöl'}],
 schritte:['Fettphase: Wachs, Emulsan und Mandelöl im Wasserbad auf ca. 65°C schmelzen.','Wasserphase: Rosenwasser ebenfalls auf 65°C erwärmen.','Wasserphase langsam in Fettphase gießen, dabei mit Milchaufschäumer kräftig mixen.','Weiterrühren bis auf 40°C abgekühlt und cremig. Ätherisches Öl einrühren.','Wichtig: Bienenwachs allein emulgiert nicht – der Emulsan ist zwingend nötig! Ohne Konservierung im Kühlschrank, innerhalb 2–3 Wochen aufbrauchen.']},

{id:'p49', kategorie:'kosmetik', titel:'Honig-Körperbutter', beschreibung:'Reichhaltige Body Butter mit Sheabutter und Bienenwachs – schmilzt auf der Haut.', schwierigkeit:'mittel', zeitaufwand:30, is_preset:true,
 zutaten:[{menge:'50',einheit:'g',zutat:'Sheabutter'},{menge:'30',einheit:'g',zutat:'Kakaobutter'},{menge:'10',einheit:'g',zutat:'Bienenwachs'},{menge:'20',einheit:'ml',zutat:'Jojobaöl'},{menge:'1',einheit:'TL',zutat:'Honig'},{menge:'5',einheit:'Tropfen',zutat:'ätherisches Vanilleöl'}],
 schritte:['Wachs und Kakaobutter im Wasserbad bei 65°C schmelzen. Sheabutter nur leicht anschmelzen.','Jojobaöl einrühren. Vom Wasserbad nehmen.','10 Min. abkühlen bis dickflüssig. Honig und ätherisches Öl einrühren.','Zügig in Tiegel abfüllen. Haltbarkeit: ca. 6 Monate (wasserfreies Produkt).']},

{id:'p50', kategorie:'kosmetik', titel:'Bienenwachs-Kerzen gießen', beschreibung:'Duftende Kerzen aus reinem Bienenwachs – natürliches Licht mit Honigduft.', schwierigkeit:'mittel', zeitaufwand:60, is_preset:true,
 zutaten:[{menge:'200',einheit:'g',zutat:'Bienenwachs'},{menge:'1',einheit:'',zutat:'Runddocht aus Baumwolle'},{menge:'1',einheit:'',zutat:'Gießform oder Schraubglas'},{menge:'1',einheit:'',zutat:'Holzspieß (Dochtfixierung)'}],
 schritte:['Docht mittig fixieren (unten befestigen, oben mit Holzspieß spannen).','Wachs im Wasserbad auf 70–75°C schmelzen (nie über 80°C!).','Langsam in die Form gießen.','Beim Abkühlen entsteht eine Mulde – mit nacherhitztem Wachs auffüllen.','Vollständig auskühlen lassen. Docht auf 1 cm kürzen.','Tipp: Für Bienenwachs Runddochte verwenden – Flachdochte verstopfen.']},

{id:'p51', kategorie:'kosmetik', titel:'Honig-Fußmaske', beschreibung:'Pflegende Fußmaske mit Honig und Joghurt – macht raue Füße weich.', schwierigkeit:'leicht', zeitaufwand:35, is_preset:true,
 zutaten:[{menge:'3',einheit:'EL',zutat:'Naturjoghurt'},{menge:'2',einheit:'EL',zutat:'Honig'},{menge:'1',einheit:'TL',zutat:'Zitronensaft'},{menge:'1',einheit:'Paar',zutat:'Baumwollsocken'}],
 schritte:['Joghurt, Honig und Zitronensaft verrühren.','Füße waschen und abtrocknen. Maske großzügig auftragen.','Baumwollsocken darüber ziehen. 20–30 Min. einwirken lassen.','Mit lauwarmem Wasser abspülen. Immer frisch zubereiten.']},

{id:'p52', kategorie:'kosmetik', titel:'Bienenwachs-Haarwachs', beschreibung:'Natürliches Styling-Wachs mit Bienenwachs und Sheabutter.', schwierigkeit:'mittel', zeitaufwand:20, is_preset:true,
 zutaten:[{menge:'45',einheit:'g',zutat:'Sheabutter'},{menge:'4',einheit:'g',zutat:'Bienenwachs'},{menge:'5',einheit:'ml',zutat:'Kokosöl'},{menge:'3',einheit:'Tropfen',zutat:'ätherisches Rosmarinöl'}],
 schritte:['Sheabutter und Wachs im Wasserbad bei 65°C schmelzen. Kokosöl einrühren.','Konsistenz prüfen: Tropfen auf kalten Teller geben. Bei Bedarf Öl (weicher) oder Wachs (fester) ergänzen.','Ätherisches Öl einrühren, zügig in Tiegel füllen.','Anwendung: Kleine Menge zwischen Handflächen erwärmen und ins Haar einarbeiten.']},

{id:'p53', kategorie:'kosmetik', titel:'Honig-Duschgel', beschreibung:'Mildes Duschgel mit Honig und Naturseife – spendet Feuchtigkeit.', schwierigkeit:'mittel', zeitaufwand:30, is_preset:true,
 zutaten:[{menge:'40',einheit:'g',zutat:'Naturseife (geraspelt)'},{menge:'400',einheit:'ml',zutat:'Wasser'},{menge:'2',einheit:'TL',zutat:'Honig'},{menge:'1',einheit:'EL',zutat:'Olivenöl'},{menge:'1',einheit:'TL',zutat:'Speisestärke'},{menge:'5',einheit:'Tropfen',zutat:'ätherisches Lavendelöl'}],
 schritte:['Seife raspeln und in heißem Wasser auflösen.','Stärke in kaltem Wasser anrühren, zur Seifenlösung geben.','Abkühlen lassen (unter 40°C!), dann Honig, Olivenöl und ätherisches Öl einrühren.','In Pumpflasche füllen. Vor Gebrauch schütteln. Ohne Konservierung innerhalb 2–3 Wochen aufbrauchen.']},

{id:'p54', kategorie:'kosmetik', titel:'Propolis-Deo-Creme', beschreibung:'Natürliches Deodorant mit Natron, Kokosöl und Propolis – ohne Aluminium. Allergiehinweis beachten!', schwierigkeit:'leicht', zeitaufwand:15, is_preset:true,
 zutaten:[{menge:'2',einheit:'EL',zutat:'Kokosöl'},{menge:'2',einheit:'TL',zutat:'Natron'},{menge:'2',einheit:'TL',zutat:'Speisestärke'},{menge:'5',einheit:'Tropfen',zutat:'Propolis-Tinktur (10%)'},{menge:'3',einheit:'Tropfen',zutat:'ätherisches Salbeiöl'}],
 schritte:['Kokosöl sanft schmelzen. Natron und Stärke einrühren.','Propolis-Tinktur und Salbeiöl dazugeben.','In kleinen Tiegel füllen und fest werden lassen.','Kleine Menge auf die Achsel auftragen. Propolis-Allergietest vorher! Nicht direkt nach Rasur (Natron reizt).']},

{id:'p55', kategorie:'kosmetik', titel:'Bienenwachs-Möbelpolitur', beschreibung:'Natürliche Holzpflege mit Bienenwachs und Olivenöl – schützt und pflegt Holzmöbel.', schwierigkeit:'leicht', zeitaufwand:20, is_preset:true,
 zutaten:[{menge:'20',einheit:'g',zutat:'Bienenwachs'},{menge:'100',einheit:'ml',zutat:'Olivenöl (hell) oder Leinöl (dunkel)'}],
 schritte:['Wachs und Öl im Wasserbad bei 65°C schmelzen und verrühren.','In Schraubglas füllen und abkühlen lassen – wird streichfähig-cremig.','Mit weichem Tuch dünn auf Holz auftragen und einpolieren.','Vorher an unauffälliger Stelle testen. Nicht auf lackierten Oberflächen.']},

{id:'p56', kategorie:'kosmetik', titel:'Honig-After-Sun-Gel', beschreibung:'Kühlendes After-Sun-Gel mit Aloe Vera und Honig.', schwierigkeit:'leicht', zeitaufwand:10, is_preset:true,
 zutaten:[{menge:'100',einheit:'ml',zutat:'Aloe-Vera-Gel (pur)'},{menge:'1',einheit:'EL',zutat:'Honig'},{menge:'1',einheit:'TL',zutat:'Kokosöl'},{menge:'3',einheit:'Tropfen',zutat:'ätherisches Lavendelöl'}],
 schritte:['Aloe-Vera-Gel mit Honig glatt rühren. Kokosöl und Lavendelöl einrühren.','In Schraubglas füllen. Im Kühlschrank aufbewahren (Kühle verstärkt Wirkung).','Ohne Konservierung innerhalb 2–3 Wochen aufbrauchen.']},

{id:'p57', kategorie:'kosmetik', titel:'Propolis-Hautöl', beschreibung:'Pflegendes Gesichts- und Körperöl mit Propolis für unreine Haut. Allergietest vorher!', schwierigkeit:'leicht', zeitaufwand:10, is_preset:true,
 zutaten:[{menge:'50',einheit:'ml',zutat:'Mandelöl (kaltgepresst)'},{menge:'15',einheit:'Tropfen',zutat:'Propolis-Tinktur (20%)'},{menge:'3',einheit:'Tropfen',zutat:'Teebaumöl (optional)'}],
 schritte:['Mandelöl in dunkle Glasflasche füllen. Propolis-Tinktur und Teebaumöl dazutropfen.','Vor jeder Anwendung gut schütteln (Öl und Tinktur verbinden sich nicht dauerhaft).','Wenige Tropfen auf gereinigte Haut auftragen. Propolis-Allergietest vorher am Handgelenk!']},

{id:'p58', kategorie:'kosmetik', titel:'Honig-Augenmaske', beschreibung:'Anti-Falten-Augenmaske mit Honig und Mandelöl für die empfindliche Augenpartie.', schwierigkeit:'leicht', zeitaufwand:25, is_preset:true,
 zutaten:[{menge:'1',einheit:'EL',zutat:'Mandelöl'},{menge:'1',einheit:'TL',zutat:'Honig'},{menge:'2',einheit:'',zutat:'Wattepads'}],
 schritte:['Mandelöl und Honig verrühren. Auf Wattepads geben.','Pads auf geschlossene Augen legen. 20 Min. einwirken lassen.','Vorsichtig mit lauwarmem Wasser abwaschen. 1–2x pro Woche.']},

{id:'p59', kategorie:'kosmetik', titel:'Honig-Nagelpflege', beschreibung:'Nagelpeeling mit Honig und Zucker – stärkt brüchige Nägel und pflegt die Nagelhaut.', schwierigkeit:'leicht', zeitaufwand:20, is_preset:true,
 zutaten:[{menge:'2',einheit:'EL',zutat:'Honig'},{menge:'1',einheit:'EL',zutat:'feiner Zucker'},{menge:'1',einheit:'EL',zutat:'Olivenöl'},{menge:'1',einheit:'Spritzer',zutat:'Zitronensaft'}],
 schritte:['Alles verrühren. Auf Hände und Nägel auftragen und in kreisenden Bewegungen einmassieren.','Besonders die Nagelhaut bearbeiten. 5 Min. einmassieren, 10 Min. einwirken.','Abspülen. Optional etwas Olivenöl in die Nagelhaut einmassieren. 1x pro Woche.']},

{id:'p60', kategorie:'kosmetik', titel:'Propolis-Akne-Tupfer', beschreibung:'Propolis-Lösung zum gezielten Auftragen auf Pickel. Allergietest vorher!', schwierigkeit:'leicht', zeitaufwand:5, is_preset:true,
 zutaten:[{menge:'100',einheit:'ml',zutat:'abgekochtes Wasser'},{menge:'10',einheit:'Tropfen',zutat:'Propolis-Tinktur (20%)'},{menge:'2',einheit:'Tropfen',zutat:'Teebaumöl'}],
 schritte:['Wasser, Propolis-Tinktur und Teebaumöl mischen. Gut schütteln.','Mit Wattestäbchen einzelne Pickel betupfen. 1–2x täglich, am besten abends.','Vor Erstanwendung Allergietest am Handgelenk! Innerhalb 2 Wochen aufbrauchen.']},

{id:'p61', kategorie:'kosmetik', titel:'Honig-Enzympeeling', beschreibung:'Sanftes Enzympeeling mit Papaya und Honig – löst Hautzellen ohne Rubbeln.', schwierigkeit:'leicht', zeitaufwand:20, is_preset:true,
 zutaten:[{menge:'1',einheit:'halbe',zutat:'Papaya (reif)'},{menge:'2',einheit:'TL',zutat:'Honig'},{menge:'1',einheit:'TL',zutat:'Joghurt (optional)'}],
 schritte:['Papaya pürieren. Honig und Joghurt unterrühren.','Auf gereinigtes Gesicht auftragen (Augen aussparen). 10 Min. einwirken, kein Rubbeln nötig.','Abspülen. 1x pro Woche. Bei starkem Kribbeln sofort abwaschen.']},

{id:'p62', kategorie:'kosmetik', titel:'Bienenwachs-Windlichter', beschreibung:'Dekorative Windlichter aus Bienenwachs mit der Ballon-Technik.', schwierigkeit:'mittel', zeitaufwand:60, is_preset:true,
 zutaten:[{menge:'500',einheit:'g',zutat:'Bienenwachs'},{menge:'1',einheit:'',zutat:'Luftballon'},{menge:'1',einheit:'',zutat:'Backpapier'},{menge:'1',einheit:'',zutat:'LED-Teelicht'}],
 schritte:['Wachs im Wasserbad auf 70–75°C schmelzen (nie über 80°C!).','Luftballon mit kaltem Wasser füllen (faustgroß), zuknoten.','Ballon bis zur gewünschten Höhe ins Wachs tauchen und herausziehen. Auf Backpapier ablegen.','8–12 Mal wiederholen bis Wachsschicht 3–5mm dick.','30 Min. auskühlen. Ballon vorsichtig anstechen, Wasser ablaufen lassen.','Rand mit warmem Messer begradigen. Nur mit LED-Teelicht verwenden!']},

{id:'p63', kategorie:'kosmetik', titel:'Honig-Seife (Schmelzmethode)', beschreibung:'Einfache Honigseife aus Rohseife – ohne Lauge, auch für Anfänger.', schwierigkeit:'leicht', zeitaufwand:30, is_preset:true,
 zutaten:[{menge:'250',einheit:'g',zutat:'Glycerin-Rohseife'},{menge:'2',einheit:'EL',zutat:'Honig'},{menge:'1',einheit:'EL',zutat:'Olivenöl'},{menge:'5',einheit:'Tropfen',zutat:'ätherisches Öl'},{menge:'1',einheit:'',zutat:'Silikonform'}],
 schritte:['Rohseife würfeln und im Wasserbad bei ca. 60°C schmelzen. Nicht kochen!','Vom Herd nehmen. Honig und Olivenöl einrühren.','Ätherisches Öl dazu. In Silikonform gießen.','Optional: Getrocknete Blüten auf die Oberfläche streuen.','Über Nacht aushärten lassen. Sofort verwendbar.']},

{id:'p64', kategorie:'kosmetik', titel:'Bienenwachs-Lederpflege', beschreibung:'Natürlicher Lederbalsam mit Bienenwachs – pflegt und imprägniert Leder.', schwierigkeit:'leicht', zeitaufwand:20, is_preset:true,
 zutaten:[{menge:'10',einheit:'g',zutat:'Bienenwachs'},{menge:'40',einheit:'g',zutat:'Lanolin (Wollwachs)'},{menge:'50',einheit:'ml',zutat:'Olivenöl'}],
 schritte:['Alles im Wasserbad bei 65°C schmelzen und verrühren.','In Schraubglas abfüllen und abkühlen lassen.','Leder reinigen, dann Balsam dünn mit weichem Tuch auftragen und einpolieren.','Vorher an unauffälliger Stelle testen.']},

{id:'p65', kategorie:'kosmetik', titel:'Honig-Milch-Haarkur', beschreibung:'Intensivkur mit Honig und Milch für trockenes Haar.', schwierigkeit:'leicht', zeitaufwand:40, is_preset:true,
 zutaten:[{menge:'3',einheit:'EL',zutat:'Honig'},{menge:'100',einheit:'ml',zutat:'Vollmilch'},{menge:'1',einheit:'EL',zutat:'Kokosöl'},{menge:'1',einheit:'',zutat:'Duschhaube'}],
 schritte:['Milch leicht erwärmen (ca. 35°C). Honig darin auflösen. Kokosöl unterrühren.','In Haarlängen und Spitzen einarbeiten (nicht auf die Kopfhaut).','Duschhaube drüber. 30 Min. einwirken lassen.','Lauwarm ausspülen, normal waschen. 1x pro Woche.']},

// =============================================
// HAUSMITTEL (ab p66)
// =============================================

{id:'p66', kategorie:'hausmittel', titel:'Honig pur bei Halsschmerzen', beschreibung:'Einen TL Honig langsam im Mund zergehen lassen – bildet Schutzfilm auf der Schleimhaut. WHO-empfohlen bei Husten. Nicht für Kinder unter 1 Jahr!', schwierigkeit:'leicht', zeitaufwand:2, is_preset:true,
 zutaten:[{menge:'1',einheit:'TL',zutat:'Honig (cremig)'},{menge:'1',einheit:'Glas',zutat:'lauwarmes Wasser'}],
 schritte:['Einen gehäuften TL cremigen Honig auf die Zunge geben.','Langsam im Mund zergehen lassen – nicht sofort schlucken.','Der Honig bildet einen beruhigenden Schutzfilm auf der Rachenschleimhaut.','Bis zu 3x täglich wiederholen. Nicht für Kinder unter 1 Jahr (Botulismus-Risiko).']},

{id:'p67', kategorie:'hausmittel', titel:'Propolis-Rachenspray', beschreibung:'Rachenspray mit Propolis und Salbei bei ersten Erkältungszeichen. Allergietest vorher!', schwierigkeit:'mittel', zeitaufwand:30, is_preset:true,
 zutaten:[{menge:'20',einheit:'ml',zutat:'abgekochtes Wasser'},{menge:'10',einheit:'Tropfen',zutat:'Propolis-Tinktur (alkoholfrei)'},{menge:'1',einheit:'TL',zutat:'starker Salbeitee (abgekühlt)'},{menge:'1',einheit:'',zutat:'Sprühflasche (30ml, steril)'}],
 schritte:['Salbeitee aufbrühen (1 EL auf 50ml Wasser, 15 Min. ziehen), abseihen und abkühlen.','Wasser und Salbeitee in Sprühflasche füllen. Propolis dazugeben, schütteln.','Bei Halsbeschwerden 2–3 Sprühstöße, bis zu 4x täglich.','Vorher Allergietest! Nicht für Kinder unter 12. Im Kühlschrank, innerhalb 1 Woche verbrauchen.']},

{id:'p68', kategorie:'hausmittel', titel:'Honig-Wundauflage', beschreibung:'Honig auf kleine, oberflächliche Wunden. Für offene Wunden NUR sterilen Medizinhonig verwenden!', schwierigkeit:'leicht', zeitaufwand:10, is_preset:true,
 zutaten:[{menge:'1',einheit:'TL',zutat:'Honig (am besten Manuka MGO 400+)'},{menge:'1',einheit:'',zutat:'sterile Mullkompresse'},{menge:'1',einheit:'',zutat:'Pflaster oder Fixierbinde'}],
 schritte:['Hände waschen und desinfizieren.','Dünne Schicht Honig auf sterile Mullkompresse auftragen.','Mit Honigseite auf die saubere, oberflächliche Wunde legen. 1–2x täglich wechseln.','NUR bei kleinen Schürfwunden! Bei tiefen, entzündeten Wunden zum Arzt. Für offene Wunden nur medizinisch zugelassenen Honig verwenden.']},

{id:'p69', kategorie:'hausmittel', titel:'Bienenwachs-Brustwickel bei Husten', beschreibung:'Wärmender Brustwickel mit Bienenwachs – löst Schleim und lindert Hustenreiz. Auch für Kinder ab 6 Monaten.', schwierigkeit:'mittel', zeitaufwand:30, is_preset:true,
 zutaten:[{menge:'1',einheit:'',zutat:'Bienenwachstuch (ca. 20x25cm)'},{menge:'1',einheit:'',zutat:'Wärmflasche oder Föhn'},{menge:'1',einheit:'',zutat:'Wollschal zum Fixieren'}],
 schritte:['Bienenwachstuch mit Föhn oder auf Wärmflasche auf angenehme Körpertemperatur erwärmen.','Auf die Brust legen, mit Wollschal umwickeln.','1–2 Stunden einwirken lassen, gerne auch über Nacht.','Wiederverwendbar – nach Gebrauch trocknen lassen, nicht waschen. Nicht bei Fieber über 38,5°C!']},

{id:'p70', kategorie:'hausmittel', titel:'Honig bei Lippenherpes', beschreibung:'Honig auf Herpesbläschen kann die Heilung beschleunigen. Studien zeigen gleichwertige Ergebnisse zu Aciclovir.', schwierigkeit:'leicht', zeitaufwand:5, is_preset:true,
 zutaten:[{menge:'1',einheit:'TL',zutat:'Honig (am besten Manuka)'},{menge:'',einheit:'',zutat:'sterile Wattestäbchen'}],
 schritte:['Hände waschen. Mit Wattestäbchen Honig aufnehmen.','Vorsichtig auf Herpesbläschen tupfen – nicht reiben!','4x täglich 15 Min. einwirken lassen. Immer frisches Wattestäbchen verwenden.','Bei großflächigem oder häufig wiederkehrendem Herpes zum Arzt.']},

{id:'p71', kategorie:'hausmittel', titel:'Propolis-Gurgellösung bei Halsschmerzen', beschreibung:'Gurgeln mit Propolis-Lösung bei Rachenentzündung. Allergietest vorher!', schwierigkeit:'leicht', zeitaufwand:5, is_preset:true,
 zutaten:[{menge:'200',einheit:'ml',zutat:'lauwarmes abgekochtes Wasser'},{menge:'10–15',einheit:'Tropfen',zutat:'Propolis-Tinktur (10%)'},{menge:'0,5',einheit:'TL',zutat:'Meersalz (optional)'}],
 schritte:['Wasser, Propolis-Tinktur und Salz verrühren.','30–60 Sek. gurgeln, ausspucken. 3–4x täglich.','Allergietest am Handgelenk vorher! Bei eitrigen Mandeln oder Fieber zum Arzt.']},

{id:'p72', kategorie:'hausmittel', titel:'Honig-Knoblauch-Ferment', beschreibung:'In Honig fermentierter Knoblauch – traditionelles Immunmittel. Nicht für Kinder unter 1 Jahr!', schwierigkeit:'leicht', zeitaufwand:15, is_preset:true,
 zutaten:[{menge:'1',einheit:'',zutat:'Knoblauchknolle (Bio, ca. 10 Zehen)'},{menge:'250',einheit:'g',zutat:'Honig (naturbelassen)'},{menge:'1',einheit:'',zutat:'sauberes Schraubglas (300ml)'}],
 schritte:['Knoblauchzehen schälen und mit Messerrücken leicht andrücken.','In Glas füllen und mit Honig bedecken.','2 Wochen täglich kurz öffnen (Gasbildung!) und umdrehen.','Nach 4 Wochen fertig. 1 TL Honig oder 1 Zehe täglich. Nicht für Kinder unter 1 Jahr! Bei Blutverdünnern vorher Arzt fragen.']},

{id:'p73', kategorie:'hausmittel', titel:'Honig-Aloe-Vera bei Sonnenbrand', beschreibung:'Kühlende Honig-Aloe-Mischung bei leichtem Sonnenbrand. Nur bei Rötung, nicht bei Blasen!', schwierigkeit:'leicht', zeitaufwand:10, is_preset:true,
 zutaten:[{menge:'2',einheit:'EL',zutat:'Aloe-Vera-Gel (frisch oder bio)'},{menge:'1',einheit:'TL',zutat:'Honig'}],
 schritte:['Aloe-Vera-Gel und Honig verrühren. 10 Min. kühlen.','Dünn auf gerötete Haut auftragen. 20 Min. einwirken, abspülen.','Bei Bedarf 2–3x täglich. Nur bei leichtem Sonnenbrand! Bei Blasen oder Fieber zum Arzt.']},

{id:'p74', kategorie:'hausmittel', titel:'Honig-Schwarzkümmelöl-Kur', beschreibung:'Traditionelle Kombination aus der orientalischen Volksheilkunde. Nicht für Kinder unter 1 Jahr!', schwierigkeit:'leicht', zeitaufwand:5, is_preset:true,
 zutaten:[{menge:'1',einheit:'TL',zutat:'Schwarzkümmelöl (kaltgepresst, bio)'},{menge:'1',einheit:'TL',zutat:'Honig'}],
 schritte:['Schwarzkümmelöl und Honig vermischen. Morgens zum Frühstück einnehmen.','3–4 Wochen Kur, dann 1 Woche Pause.','Nicht für Kinder unter 1 Jahr, nicht in der Schwangerschaft. Bei Magenreizung absetzen.']},

{id:'p75', kategorie:'hausmittel', titel:'Honig-Kartoffelwickel bei Husten', beschreibung:'Wärmender Wickel mit Kartoffeln und Honig – löst festsitzenden Schleim.', schwierigkeit:'leicht', zeitaufwand:40, is_preset:true,
 zutaten:[{menge:'3',einheit:'',zutat:'mittelgroße Kartoffeln'},{menge:'1',einheit:'EL',zutat:'Honig'},{menge:'1',einheit:'',zutat:'Geschirrtuch'},{menge:'1',einheit:'',zutat:'Wollschal'}],
 schritte:['Kartoffeln weich kochen, etwas abkühlen und grob zerdrücken.','Honig darüber verteilen, in Tuch einschlagen.','Temperatur am Unterarm prüfen – angenehm warm, nicht heiß!','Auf die Brust legen, mit Schal fixieren. 30–60 Min. Nicht bei Fieber über 38,5°C!']},

{id:'p76', kategorie:'hausmittel', titel:'Ingwer-Honig-Shot', beschreibung:'Scharfer Immun-Shot für die Erkältungszeit. Nicht für Kinder unter 1 Jahr!', schwierigkeit:'leicht', zeitaufwand:15, is_preset:true,
 zutaten:[{menge:'50',einheit:'g',zutat:'frischer Ingwer'},{menge:'2',einheit:'',zutat:'Zitronen (Saft)'},{menge:'2',einheit:'EL',zutat:'Honig'},{menge:'100',einheit:'ml',zutat:'Wasser'}],
 schritte:['Ingwer, Zitronensaft und Wasser im Mixer pürieren. Abseihen.','Honig einrühren (unter 40°C!).','1x täglich 30–40ml nach dem Frühstück – nie auf leeren Magen! Im Kühlschrank ca. 2 Wochen haltbar.']},

{id:'p77', kategorie:'hausmittel', titel:'Honig-Thymian-Sirup gegen Husten', beschreibung:'Hustensirup mit Thymian und Honig. Thymian wirkt schleimlösend. Nicht für Kinder unter 1 Jahr!', schwierigkeit:'leicht', zeitaufwand:25, is_preset:true,
 zutaten:[{menge:'1',einheit:'Handvoll',zutat:'frischer Thymian (oder 2 EL getrockneter)'},{menge:'250',einheit:'ml',zutat:'Wasser'},{menge:'150',einheit:'g',zutat:'Honig'}],
 schritte:['Wasser aufkochen, Thymian dazu. 15–20 Min. zugedeckt köcheln.','Abseihen und unter 40°C abkühlen lassen.','Erst dann Honig einrühren (Enzyme erhalten!).','Erwachsene: 2–3x täglich 1–2 TL. Kinder ab 1 Jahr: 2x täglich 1 TL. Im Kühlschrank 4 Wochen haltbar.']},

{id:'p78', kategorie:'hausmittel', titel:'Honig-Salbei-Bonbons', beschreibung:'Hustenbonbons mit Salbei und Honig. Honig wird kurz erhitzt – ein Teil der Enzyme geht verloren.', schwierigkeit:'mittel', zeitaufwand:45, is_preset:true,
 zutaten:[{menge:'100',einheit:'g',zutat:'Zucker'},{menge:'2',einheit:'EL',zutat:'Honig'},{menge:'5',einheit:'',zutat:'frische Salbeiblätter'},{menge:'50',einheit:'ml',zutat:'Wasser'},{menge:'',einheit:'',zutat:'Puderzucker'}],
 schritte:['Salbei in 50ml Wasser aufkochen, 15 Min. ziehen, abseihen.','Sud mit Zucker aufkochen bis goldbraun (ca. 150°C, Tropfprobe).','Vom Herd, kurz abkühlen und Honig einrühren.','Mit Teelöffel kleine Portionen auf Backpapier setzen. In Puderzucker wälzen.']},

{id:'p79', kategorie:'hausmittel', titel:'Honig-Meerrettich bei Blasenentzündung', beschreibung:'Meerrettich enthält antibakterielle Senföle. Nur bei leichten Beschwerden! Nicht für Kinder unter 1 Jahr!', schwierigkeit:'leicht', zeitaufwand:15, is_preset:true,
 zutaten:[{menge:'1',einheit:'EL',zutat:'frischer Meerrettich (fein gerieben)'},{menge:'2',einheit:'EL',zutat:'Honig'}],
 schritte:['Meerrettich frisch reiben (Vorsicht: reizt Augen!). Mit Honig mischen.','2 Stunden ziehen lassen. 3x täglich 1 TL einnehmen.','Dazu viel trinken (mind. 2–3L/Tag)! Bei Fieber, Blut im Urin oder Nierenschmerzen sofort zum Arzt!']},

{id:'p80', kategorie:'hausmittel', titel:'Propolis bei Zahnfleischentzündung', beschreibung:'Propolis direkt auf entzündetes Zahnfleisch – entzündungshemmend. Allergietest vorher!', schwierigkeit:'leicht', zeitaufwand:5, is_preset:true,
 zutaten:[{menge:'2–3',einheit:'Tropfen',zutat:'Propolis-Tinktur (10%, alkoholfrei bevorzugt)'},{menge:'1',einheit:'',zutat:'steriles Wattestäbchen'}],
 schritte:['Hände waschen. 2–3 Tropfen Propolis auf Wattestäbchen.','Vorsichtig auf die entzündete Stelle tupfen. 5–10 Min. einwirken.','2–3x täglich. Allergietest vorher! Ersetzt keine Parodontose-Behandlung.']},

{id:'p81', kategorie:'hausmittel', titel:'Propolis-Inhalation', beschreibung:'Dampfinhalation mit Propolis bei verstopfter Nase und Nebenhöhlen. Allergietest vorher!', schwierigkeit:'leicht', zeitaufwand:15, is_preset:true,
 zutaten:[{menge:'500',einheit:'ml',zutat:'heißes Wasser (70–80°C)'},{menge:'15–20',einheit:'Tropfen',zutat:'Propolis-Tinktur (alkoholfrei)'},{menge:'1',einheit:'',zutat:'Schüssel'},{menge:'1',einheit:'',zutat:'großes Handtuch'}],
 schritte:['Heißes Wasser in Schüssel, Propolis dazutropfen.','Kopf über die Schüssel, Handtuch über Kopf und Schüssel.','10–15 Min. durch die Nase ein-, durch den Mund ausatmen. Augen geschlossen!','1–2x täglich. Abstand halten (Verbrühungsgefahr!). Allergietest vorher!']},

{id:'p82', kategorie:'hausmittel', titel:'Honig bei Magenbeschwerden', beschreibung:'Manuka-Honig kann bei Magenschleimhautreizung lindernd wirken. Kein Ersatz für ärztliche Behandlung!', schwierigkeit:'leicht', zeitaufwand:5, is_preset:true,
 zutaten:[{menge:'1',einheit:'EL',zutat:'Manuka-Honig (MGO 250+)'},{menge:'1',einheit:'Glas',zutat:'lauwarmer Kamillentee (optional)'}],
 schritte:['1 EL Manuka-Honig pur langsam zergehen lassen.','Optional mit lauwarmem Kamillentee (unter 40°C) nachtrinken.','Morgens und abends. Bei anhaltenden Schmerzen zum Arzt! Nicht für Kinder unter 1 Jahr.']},

{id:'p83', kategorie:'hausmittel', titel:'Bienenwachs-Beinwell-Salbe', beschreibung:'Traditionelle Beinwell-Salbe bei Gelenk- und Muskelschmerzen. Nur äußerlich!', schwierigkeit:'fortgeschritten', zeitaufwand:60, is_preset:true,
 zutaten:[{menge:'20',einheit:'g',zutat:'getrocknete Beinwellwurzel'},{menge:'100',einheit:'ml',zutat:'Olivenöl'},{menge:'10',einheit:'g',zutat:'Bienenwachs'},{menge:'5',einheit:'Tropfen',zutat:'ätherisches Rosmarinöl (optional)'}],
 schritte:['Beinwellwurzel in Olivenöl bei max. 70°C im Wasserbad 30 Min. erwärmen.','Durch Tuch oder Kaffeefilter abseihen.','Bienenwachs schmelzen und Beinwell-Öl einrühren. Optional Rosmarinöl dazu.','In Tiegel füllen und abkühlen lassen. Nur äußerlich! Nicht auf offene Wunden, nicht bei Kindern unter 12.']},

{id:'p84', kategorie:'hausmittel', titel:'Honig-Leinsamen bei Verdauung', beschreibung:'Sanftes Hausmittel bei träger Verdauung. Viel trinken! Nicht für Kinder unter 1 Jahr!', schwierigkeit:'leicht', zeitaufwand:15, is_preset:true,
 zutaten:[{menge:'1',einheit:'EL',zutat:'geschrotete Leinsamen'},{menge:'250',einheit:'ml',zutat:'lauwarmes Wasser'},{menge:'1',einheit:'TL',zutat:'Honig'}],
 schritte:['Leinsamen in lauwarmem Wasser 10–15 Min. quellen lassen.','Honig einrühren (Wasser unter 40°C!). Die ganze Mischung trinken.','Morgens vor dem Frühstück. Wichtig: Zusätzlich mind. 1,5L Wasser am Tag trinken!']},

{id:'p85', kategorie:'hausmittel', titel:'Honig-Zwiebel-Ohrensäckchen', beschreibung:'Zwiebelsäckchen mit Honig bei leichten Ohrenschmerzen. Nicht INS Ohr tropfen!', schwierigkeit:'leicht', zeitaufwand:15, is_preset:true,
 zutaten:[{menge:'1',einheit:'',zutat:'kleine Zwiebel'},{menge:'1',einheit:'TL',zutat:'Honig'},{menge:'1',einheit:'',zutat:'Mullbinde'},{menge:'1',einheit:'',zutat:'Stirnband oder Mütze'}],
 schritte:['Zwiebel fein würfeln, mit Honig mischen. In Mullbinde einschlagen.','Kurz auf warmem Topfdeckel anwärmen (handwarm!).','AUF das Ohr legen (nichts INS Ohr!), mit Stirnband fixieren. 30–60 Min.','Bei starken Schmerzen, Fieber oder Ausfluss sofort zum Arzt!']},

{id:'p86', kategorie:'hausmittel', titel:'Honig-Kurkuma-Paste (Goldener Honig)', beschreibung:'Ayurvedische Mischung – Kurkuma wirkt entzündungshemmend, Pfeffer verbessert die Aufnahme. Nicht für Kinder unter 1 Jahr!', schwierigkeit:'leicht', zeitaufwand:10, is_preset:true,
 zutaten:[{menge:'100',einheit:'g',zutat:'Honig'},{menge:'1',einheit:'EL',zutat:'Kurkumapulver (bio)'},{menge:'1',einheit:'Prise',zutat:'schwarzer Pfeffer (frisch)'}],
 schritte:['Honig und Kurkuma glatt verrühren. Pfeffer dazugeben (verbessert Curcumin-Aufnahme um bis zu 2000%).','In sauberes Glas füllen. Hält sich mehrere Wochen.','1 TL täglich pur oder in lauwarmen Tee (unter 40°C).','Kurkuma färbt stark – Vorsicht mit Kleidung! Nicht für Kinder unter 1 Jahr. Bei Gallensteinen oder Blutverdünnern vorher Arzt fragen.']},

{id:'p87', kategorie:'hausmittel', titel:'Honig-Essig-Wadenwickel bei Fieber', beschreibung:'Traditioneller Wadenwickel – kann leicht erhöhte Temperatur sanft senken.', schwierigkeit:'leicht', zeitaufwand:20, is_preset:true,
 zutaten:[{menge:'1',einheit:'Liter',zutat:'lauwarmes Wasser (2°C unter Körpertemp.)'},{menge:'2',einheit:'EL',zutat:'Apfelessig'},{menge:'1',einheit:'EL',zutat:'Honig'},{menge:'2',einheit:'',zutat:'Baumwolltücher'},{menge:'2',einheit:'',zutat:'trockene Handtücher'}],
 schritte:['Wasser, Essig und Honig mischen.','Tücher eintauchen, auswringen. Um beide Waden wickeln, trockene Tücher darüber.','Abnehmen wenn körperwarm (ca. 10–15 Min.).','Keine Wadenwickel bei kalten Füßen oder Schüttelfrost! Nicht bei Kindern unter 6 Monaten. Bei Fieber über 39,5°C oder länger als 3 Tage zum Arzt.']},

{id:'p88', kategorie:'hausmittel', titel:'Oxymel – Honig-Essig-Trunk', beschreibung:'Sauerhonig – Jahrtausende altes Hausmittel. Nicht für Kinder unter 1 Jahr und bei Sodbrennen!', schwierigkeit:'leicht', zeitaufwand:20, is_preset:true,
 zutaten:[{menge:'3',einheit:'Teile',zutat:'Honig (flüssig)'},{menge:'1',einheit:'Teil',zutat:'naturtrüber Bio-Apfelessig'}],
 schritte:['Honig und Essig 3:1 in sauberem Glas verrühren.','Kühl und dunkel lagern – hält sich mehrere Monate.','Täglich 1–2 EL in lauwarmem Wasser (unter 40°C) vor dem Frühstück.','Nicht bei Sodbrennen anwenden. Nicht für Kinder unter 1 Jahr.']},

{id:'p89', kategorie:'hausmittel', titel:'Honig-Thymian-Dampfbad', beschreibung:'Dampfinhalation mit Thymian und Honig bei Erkältung – befreit die Atemwege.', schwierigkeit:'leicht', zeitaufwand:20, is_preset:true,
 zutaten:[{menge:'500',einheit:'ml',zutat:'heißes Wasser (70–80°C)'},{menge:'2',einheit:'EL',zutat:'getrockneter Thymian'},{menge:'1',einheit:'EL',zutat:'Honig'},{menge:'1',einheit:'',zutat:'Schüssel und Handtuch'}],
 schritte:['Thymian mit heißem Wasser aufgießen, 5 Min. ziehen lassen.','Honig einrühren.','Kopf über die Schüssel, Handtuch darüber. 10 Min. einatmen. Augen geschlossen!','Abstand halten (Verbrühungsgefahr!). 1–2x täglich bei Erkältung.']},

{id:'p90', kategorie:'hausmittel', titel:'Honig-Quark-Maske bei Insektenstichen', beschreibung:'Kühlende Honig-Quark-Auflage bei Insektenstichen – lindert Schwellung und Juckreiz.', schwierigkeit:'leicht', zeitaufwand:10, is_preset:true,
 zutaten:[{menge:'2',einheit:'EL',zutat:'Quark (kühlschrankkalt)'},{menge:'1',einheit:'TL',zutat:'Honig'},{menge:'1',einheit:'',zutat:'Mullkompresse'}],
 schritte:['Quark und Honig verrühren.','Auf eine Mullkompresse streichen und auf den Stich legen.','15–20 Min. einwirken lassen. Bei Bedarf wiederholen.','Bei allergischer Reaktion (Atemnot, Schwellung im Gesicht) sofort Notruf 112!']}

];
