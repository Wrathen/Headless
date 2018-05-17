var room = HBInit({ roomName: "Oda İsmi", playerName: "Bot İsmi", public:true, maxPlayers: 8 });
var botSus = false;
var pause = false;
var kotuAdminler = [];
var kotuAdminOy = 0;
var kotuAdminGerekliOy = 5;
var oyVermisler = [];
var oyVermeDelay = 1000 * 60;
var banKaldirInterval;
var banKaldirSure = 1000 * 300;
var sonBanlananSayaci = 0;
var sonBanlananInterval;
var sonBanlananSure = 1000 * 10;
var sonBanlananGerekli = 3;
var dolar = "Dolar = 4,42012394 TL  --  20:45 İtibariyle..";

// Oyun Fonksiyonları

function V1Gec(){room.stopGame();setTimeout(function() {room.setDefaultStadium("Classic");room.setScoreLimit(2);room.setTimeLimit(2);room.startGame();}, 200);};
function V3Gec(){room.stopGame();setTimeout(function() {room.setDefaultStadium("Big");room.setScoreLimit(3);room.setTimeLimit(3);room.startGame();}, 200);};

// Bot Fonksiyonları

function Mesaj(msg, botsusGecersiz=true){if(!botsusGecersiz && botSus){return;}room.sendChat(msg);};
function SusBot(){if(!botSus){Mesaj("Bot Artık Fazla Konuşmayacak.",true);}else{Mesaj("Bot Artık Konuşacak!",true)}botSus=!botSus;}

// Oyuncu Fonksiyonları

function Kick(name, msg){room.kickPlayer(GetPlayerByName(name)[0].id,msg,false);}
function Ban(name, msg){room.kickPlayer(GetPlayerByName(name)[0].id,msg,true);}
function GetAllPlayers(){return room.getPlayerList().filter((player) => player.id != 0 );};
function GetPlayerByName(name){return room.getPlayerList().filter((player) => player.name == name);};
function GetAdmin(){return room.getPlayerList().filter((player) => player.admin == true && player.id != 0)[0];};
function GetAllAdmins(){return room.getPlayerList().filter((player) => player.admin == true && player.id != 0);};
function BanKaldir(){Mesaj("Tüm Banlar Kaldırıldı!",false);room.clearBans();}
function IsKotuAdmin(name){for(var i=0;i<kotuAdminler.length;i++){if(kotuAdminler[i].name == name){return true;}}return false;}
function DidVote(name){for(var i=0;i<oyVermisler.length;i++){if(oyVermisler[i].name == name){return true;}}return false;}
function VoteKotuAdmin(player){if(DidVote(player.name)){Mesaj("Sayın " + player.name + ", Bir Sonraki Oy Kullanma Hakkınız " + oyVermeDelay/1000 + " Saniye Sonra Gelecektir.",false);return;}var simdikiAdmin=GetAdmin();if(simdikiAdmin==null){Mesaj("Odada Bir Admin Yok! Admin Olmak için !admin Yaz!",true);return;}if(++kotuAdminOy>kotuAdminGerekliOy-1){KotuAdminYap();}else{Mesaj("Kötü Admin Oylaması: " + kotuAdminOy + "/"+kotuAdminGerekliOy+"  [" + simdikiAdmin.name + "]",true);}oyVermisler[oyVermisler.length]=player;setTimeout(function(){if(--kotuAdminOy<0){kotuAdminOy++;};for(var i=0;i<oyVermisler.length;i++){if(oyVermisler[i].name == player.name){oyVermisler.splice(i,1);}}}, oyVermeDelay);}
function KotuAdminYap(){var simdikiAdmin = GetAdmin();kotuAdminler[kotuAdminler.length]=simdikiAdmin;room.setPlayerAdmin(simdikiAdmin.id, false);Mesaj(simdikiAdmin.name + " Kötü Admin Seçildi! Yeni Admin Olmak İçin !admin Yaz!",true);};
function AdminYap(player){if(GetAdmin()==null&&!IsKotuAdmin(player.name)){room.setPlayerAdmin(player.id, true);Mesaj(player.name + " Artık Bir Adminsiniz!",true);kotuAdminOy=0;}else if(IsKotuAdmin(player.name)){Mesaj("Üzgünüm " + player.name + "! Kötü Admin Olduğun İçin Sana Adminlik Veremiyorum.",false);}else{Mesaj("Odada Zaten Bir Admin Bulunuyor! Adminliği Ele Geçiremezsin.",false);}}
function KickAll(msg = "Herkesi Kickliyorum..", ban = false){var players=GetAllPlayers();for(var i=0;i<players.length;i++){room.kickPlayer(players[i].id,msg,ban);}}
function AdminDegis(name, VoteKotuAdmin = false, tumAdminleriDegis = true){if(VoteKotuAdmin){KotuAdminYap();}if(tumAdminleriDegis){var admins=GetAllAdmins();for(var i=0;i<admins.length;i++){room.setPlayerAdmin(admins[i].id,false);}}else{room.setPlayerAdmin(GetAdmin().id,false);}room.setPlayerAdmin(GetPlayerByName(name)[0].id,true);Mesaj("Admin Değiştirildi.");}
function KotuAdminKaldir(name){for(var i=0;i<kotuAdminler.length;i++){if(kotuAdminler[i].name == name){kotuAdminler.splice(i,1);Mesaj(name + " Artık İyi Bir Admin!",true);return;}}}

// Events
room.onPlayerJoin = function(player) {console.log(player.name + " has joined.");Mesaj("Hoş Geldin " + player.name + "!",false); if(GetAdmin()==null){Mesaj("Odada Admin Yok! Admin Olmak İçin !admin Yaz! Komutlar İçin !komutlar Yazabilirsin!",true);}}
room.onPlayerLeave = function(player) {if(++sonBanlananSayaci>sonBanlananGerekli-1 && GetAdmin() != null){sonBanlananSayaci=0;Mesaj("Kötü Admin!");BanKaldir();KotuAdminYap();}console.log(player.name + " has left.");if(player.admin){Mesaj("Bir Önceki Admin Ayrıldı. !admin Yazarak Admin Olun!");}}
room.onTeamVictory = function(scores) {if(scores.red>scores.blue){Mesaj("Tebrikler Kırmızı Takım!",false);}else{Mesaj("Tebrikler Mavi Takım!",false);}}
room.onPlayerChat = function(player, message) {console.log(player.name + ": " + message); if(player.admin){if(message == "!p"){room.pauseGame(!pause); pause = !pause;}else if(message=="!sessizbot"){SusBot();}else if(message == "!admin"){room.setPlayerAdmin(player.id, !player.admin);}else if(message == "!basla"){room.startGame();}else if(message=="!bitir"){room.stopGame();}else if(message=="!v3"){V3Gec();}else if(message=="!rovans"){room.stopGame();room.startGame();}else if(message=="!v1"){V1Gec();}else if(message=="!bankaldir"){Mesaj("Tüm Banlar Kaldırıldı!",true);room.clearBans();}else if(message=="!komutlar"){Mesaj("[" + player.name + " - Admin] Size Uygun Komutlar: !p, !admin, !basla, !bitir, !rovans, !v3, !v1, !bankaldir, !sessizbot",true);}} else {if(message=="!komutlar"){Mesaj("[" + player.name + " - Oyuncu] Size Uygun Komutlar: !admin, !merhaba, !reklam, !dolar, !iletisim, !VoteKotuAdmin",false);}else if(message=="!dolar"){Mesaj(dolar);}else if(message=="!iletisim"){Mesaj("İletisim Bilgileri",false);}else if(message=="!merhaba"){Mesaj("Sana da Merhaba " + player.name + "!",false);}else if(message=="!reklam"){Mesaj("Reklam Mesajı",false);}else if(message=="!VoteKotuAdmin"){VoteKotuAdmin(player);}else if(message=="!admin"){AdminYap(player);}}};

// Intervals
banKaldirInterval = setInterval(function() {Mesaj("Tüm Banlar Kaldırıldı! " + banKaldirSure/1000 + " Saniye Sonra Banlar Yeniden Kaldırılacak!");room.clearBans();},banKaldirSure);
sonBanlananInterval = setInterval(function() {sonBanlananSayaci=0;}, sonBanlananSure);
