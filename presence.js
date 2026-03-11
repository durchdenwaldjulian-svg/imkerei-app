// ============================================
// IMKEREI TAGESPLANER – PRESENCE TRACKER
// presence.js – meldet User als online im Supabase Presence Channel
// Wird in allen Seiten eingebunden (nach config.js)
// imkeradmin.html liest diesen Channel aus
// ============================================

(function(){
    var retryCount = 0;
    var maxRetries = 10;

    function startPresence() {
        if (typeof sb === 'undefined' || typeof currentUser === 'undefined' || !currentUser) {
            retryCount++;
            if (retryCount < maxRetries) {
                setTimeout(startPresence, 1000);
            }
            return;
        }

        try {
            var seite = window.location.pathname.split('/').pop() || 'app.html';
            if (seite === '') seite = 'app.html';

            // Seitenname hübsch formatieren
            var seitenNamen = {
                'app.html': 'Heute',
                'voelker.html': 'Völker & Standorte',
                'behandlung.html': 'Behandlungen',
                'tracht.html': 'Tracht',
                'packliste.html': 'Packliste',
                'zuchtplan.html': 'Königinnenzucht',
                'ernte.html': 'Honigernte',
                'assistent.html': 'Assistent',
                'bestandsbuch.html': 'Bestandsbuch',
                'forum.html': 'Forum',
                'trachtkarte.html': 'Trachtkarte',
                'verein_trachten.html': 'Vereins-Trachten',
                'hornisse.html': 'Hornissen-Melder'
            };
            var seitenLabel = seitenNamen[seite] || seite;

            // Hash-Page für app.html berücksichtigen
            if (seite === 'app.html' && window.location.hash) {
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

            // Globalen presenceChannel aus config.js nutzen falls vorhanden, sonst neuen erstellen
            if (typeof presenceChannel !== 'undefined' && presenceChannel) {
                presenceChannel.untrack();
            }
            presenceChannel = sb.channel('online-users');

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
                var h = window.location.hash.replace('#','');
                var hashNamen = {
                    'heute': 'Heute', 'aufgaben': 'Aufgaben', 'kosten': 'Kosten',
                    'einstellungen': 'Einstellungen', 'wetter': 'Wetter'
                };
                var neueSeite = hashNamen[h] || seitenLabel;
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
        } catch(e) {
            console.warn('Presence-Fehler:', e);
        }
    }

    // Start nach kurzer Verzögerung (Auth muss erst laden)
    setTimeout(startPresence, 2000);
})();
