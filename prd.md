📄 Product Requirements Document (PRD)

Proje Adı: Language Story App Backend
Teknoloji: Node.js (MVC yapısı), Express
Veritabanı: postgresql

🎯 1. Amaç

Kullanıcıların e-posta ve şifre ile giriş/kayıt olabildiği, hikaye okuyup kaydedebildiği, kelime ekleyebildiği ve coin sisteminin bulunduğu çok dilli bir backend sistemi geliştirilecek.
🧩 2. Temel Özellikler
🔐 2.1 Kimlik Doğrulama (Auth)

    Kullanıcı e-posta ve şifre ile kayıt olabilir.

    Kullanıcı e-posta ve şifre ile giriş yapabilir.

    JWT ile oturum yönetimi yapılır.

👤 2.2 Kullanıcı Profili

    email, password (hashlenmiş), coin (integer) bilgilerini içerir.

    Her kullanıcı çok dilli verilerle çalışabilir.

📖 2.3 Hikaye Yönetimi (Stories)

    Her kullanıcı, bir hikayeyi seçtiği bir dil için kaydedebilir.

    Hikayeler önceden oluşturulmuş olabilir ya da kullanıcıya özel olabilir.

🧠 2.4 Kelime Yönetimi (Words)

    Her kullanıcı, seçtiği dil için kelime ve anlam kaydedebilir.

🧱 3. Veri Yapısı
3.1 User

{
  id: string;
  email: string;
  password: string; // hashed
  coin: number;
  languages: {
    [languageCode: string]: {
      stories: Story[];
      words: SavedWord[];
    };
  };
}

    🔁 Diller JSON içinde dinamik olarak tutulur: "english", "spanish", "german" gibi.

3.2 Story (kaydedilen format)

export interface Story {
  id: string;
  title: string;
  content: string;
  language: string;
  level?: string;
  minutes?: number;
  words?: number;
  genre?: StoryGenre;
  thumbnail?: {
    backgroundColor: string;
    svgIndex: number;
  };
  description?: string;
  coverImageUri?: string;
}

3.3 SavedWord

export interface SavedWord {
  id: string;
  word: string;
  meaning: string;
}

🚦 4. API Uç Noktaları (REST)
🔐 Auth
Yöntem	URL	Açıklama
POST	/api/auth/register	Yeni kullanıcı kaydı
POST	/api/auth/login	Giriş ve JWT token alma
👤 Kullanıcı
Yöntem	URL	Açıklama
GET	/api/user/profile	Kullanıcı bilgilerini getir
PATCH	/api/user/coin	Kullanıcının coin'ini güncelle
📖 Hikaye
Yöntem	URL	Açıklama
GET	/api/stories/:language	Kullanıcının kaydettiği hikayeleri getir
POST	/api/stories/:language	Yeni bir hikaye kaydet
DELETE	/api/stories/:language/:storyId	Kaydedilen bir hikayeyi sil
🧠 Kelime
Yöntem	URL	Açıklama
GET	/api/words/:language	Kullanıcının kaydettiği kelimeleri getir
POST	/api/words/:language	Yeni kelime kaydet
DELETE	/api/words/:language/:wordId	Kelimeyi sil
🔐 5. Güvenlik

    Şifreler bcrypt ile hashlenir.

    Kimlik doğrulamada JWT kullanılır.

    Yetkisiz kullanıcılar, korumalı uç noktalara erişemez.

🧪 6. Test Senaryoları (Örnek)

Kullanıcı kayıt olup giriş yapabilmeli.

Kullanıcı farklı dillerde kelime ekleyebilmeli.

Kullanıcı coin artışı güncelleyebilmeli.

    Bir hikaye sadece o dil içinde kaydedilmeli.

