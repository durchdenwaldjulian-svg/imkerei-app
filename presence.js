// ============================================
// IMKEREI TAGESPLANER – PRESENCE TRACKER
// presence.js – meldet User als online im Supabase Presence Channel
// Wird in allen Seiten eingebunden (nach config.js)
// imkermeister.html liest diesen Channel aus
// ============================================

(function(){
    // Warte bis Supabase und Auth geladen sind
    function initPresence() {
        if (typeof sb === 'undefined' || typeof currentUser === 'undefined') {
            setTimeout(initPresence, 500);
            return;
        }
        // Warte bis currentUser gesetzt ist (Auth abgeschlossen)
        if (!currentUser) {
            setTimeout(initPresence, 1000);
            return;
        }

        try {
            var seite = window.location.pathname.split('/').pop() || 'index.html';
            if (seite === '') seite = 'index.html';

            // Seitenname hübsch formatieren
            var seitenNamen = {
                'index.html': 'Heute',
                'voelker.html': 'Völker & Standorte',
                'behandlung.html': 'Behandlungen',
                'tracht.html': 'Tracht',
                'packliste.html': 'Packliste',
                'zuchtplan.html': 'Königinnenzucht',
                'ernte.html': 'Honigernte',
                'assistent.html': 'Assistent',
                'bestandsbuch.html': 'Bestandsbuch',
                'forum.html': 'Forum',
                'trachtkarte.html': 'Trachtkarte'
            };
            var seitenLabel = seitenNamen[seite] || seite;

            // Hash-Page für index.html berücksichtigen
            if (seite === 'index.html' && window.location.hash) {
                var hash = window.location.hash.replace('#','');
                var hashNamen = {
                    'heute': 'Heute', 'aufgaben': 'Aufgaben', 'kosten': 'Kosten',
                    'einstellungen': 'Einstellungen', 'wetter': 'Wetter'
                };
                if (hashNamen[hash]) seitenLabel = hashNamen[hash];
            }

            // Username aus Profil oder Email
            var userName = 'Imker';
            if (typeof app !== 'undefined' && app.data && app.data.profil && app.data.profil.name) {
                userName = app.data.profil.name;
            } else if (currentUser.email) {
                userName = currentUser.email.split('@')[0];
            }

            var presenceChannel = sb.channel('online-users');
            
            presenceChannel.subscribe(function(status) {
                if (status === 'SUBSCRIBED') {
                    presenceChannel.track({
                        user_id: currentUser.id,
                        name: userName,
                        seite: seitenLabel,
                        online_seit: new Date().toISOString()
                    });
                }
            });

            // Bei Seitenwechsel (Hash-Change) aktualisieren
            window.addEventListener('hashchange', function() {
                var hash = window.location.hash.replace('#','');
                var hashNamen = {
                    'heute': 'Heute', 'aufgaben': 'Aufgaben', 'kosten': 'Kosten',
                    'einstellungen': 'Einstellungen', 'wetter': 'Wetter'
                };
                var neueSeite = hashNamen[hash] || seitenLabel;
                presenceChannel.track({
                    user_id: currentUser.id,
                    name: userName,
                    seite: neueSeite,
                    online_seit: new Date().toISOString()
                });
            });

            // Cleanup bei Seitenverlassen
            window.addEventListener('beforeunload', function() {
                presenceChannel.untrack();
            });

            console.log('🟢 Presence aktiv: ' + userName + ' auf ' + seitenLabel);
        } catch(e) {
            console.warn('Presence-Fehler:', e);
        }
    }

    // Start nach kurzer Verzögerung (Auth muss erst laden)
    setTimeout(initPresence, 2000);
})();
