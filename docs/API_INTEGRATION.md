Google Maps Platform API'lerinin Next.js ile Entegrasyonu: Kapsamlı Bir Teknik RaporBu rapor, yazılım mühendisliği ekibine Google Maps Platformu'nun altı temel API'sinin (Directions, Places, Places API (New), Geocoding, Roads ve Geolocation) modern bir Next.js uygulamasına entegrasyonu için eksiksiz bir teknik kılavuz sunmak amacıyla hazırlanmıştır. Rapor, tek bir API anahtarı kullanarak güvenli, performanslı ve sürdürülebilir bir mimari kurma üzerine odaklanmaktadır. Uygulama geliştirme sürecinin her aşaması, temel yapılandırmadan ileri düzey uygulama desenlerine ve operasyonel yönetime kadar ayrıntılı olarak ele alınmaktadır.Bölüm 1: Temel Çerçeve ve Güvenlik YapılandırmasıBaşarılı ve sürdürülebilir bir entegrasyonun temeli, projenin başlangıcında atılan doğru adımlara dayanır. Bu bölümde, güvenlik ve doğru yapılandırmanın bir sonradan düşünme değil, projenin vazgeçilmez bir önkoşulu olduğu vurgulanarak, gerekli altyapının nasıl kurulacağı adım adım açıklanmaktadır.1.1. Google Cloud Platform Projesi Başlatma ve API'leri EtkinleştirmeEntegrasyon sürecinin ilk adımı, Google Cloud Platform (GCP) üzerinde uygun bir proje ortamı oluşturmaktır. Bu, tüm API kullanımının, faturalandırmanın ve güvenliğin merkezi olarak yönetileceği temeldir.Süreç, Google Cloud Console'a giriş yapmakla başlar. Yeni bir proje oluşturulmalı veya mevcut bir proje seçilmelidir.1 Google Maps Platform API'lerini kullanabilmek için projenin bir faturalandırma hesabına bağlanması zorunludur. Google, uygun hesaplar için genellikle aylık olarak yenilenen ücretsiz kullanım kredileri sunmaktadır, bu da geliştirme ve test aşamaları için önemli bir avantaj sağlar.1Faturalandırma etkinleştirildikten sonra, projenin "API'ler ve Hizmetler" > "Kitaplık" bölümünden bu entegrasyon için gerekli olan altı API'nin her biri manuel olarak etkinleştirilmelidir 3:Directions APIPlaces APIGeocoding APIRoads APIGeolocation APIMaps JavaScript APIBu API'lerden bazıları, özellikle Places API, etkinleştirildiğinde ilişkili kütüphaneleri ve SDK'ları (örneğin, Maps JavaScript API içerisindeki Places Kütüphanesi) otomatik olarak etkinleştirebilir.1 Ancak, her bir API'nin durumunu manuel olarak kontrol etmek en iyi uygulamadır.API'ler etkinleştirildikten sonra, "API'ler ve Hizmetler" > "Kimlik Bilgileri" sayfasından yeni bir API anahtarı oluşturulmalıdır. Bu raporun amacı doğrultusunda, tüm servisler için tek bir anahtar kullanılacaktır. Oluşturulan bu anahtar, uygulamanın Google servisleriyle kimlik doğrulaması yapmasını ve kullanımın projenizle ilişkilendirilmesini sağlar. Ancak, bu anahtarın oluşturulduğu an itibarıyla, güvenlik kısıtlamaları uygulanmadan kullanılması ciddi bir risk teşkil eder.11.2. API Anahtarı Güvenliği: Temel Bir Mimari SütunWeb geliştirmedeki en yaygın ve kritik güvenlik zafiyetlerinden biri, hassas API anahtarlarının istemci tarafında (kullanıcının tarayıcısında) ifşa edilmesidir. Next.js'in modern mimarisi ve Google Cloud'un sunduğu kısıtlama mekanizmaları, bu riski ortadan kaldırmak için katmanlı bir savunma stratejisi sunar.1.2.1. Next.js'te İstemci ve Sunucu Tarafı Değişkenlerinin Temel AyrımıNext.js, ortam değişkenlerini (environment variables) yönetirken güvenlik açısından kritik bir ayrım yapar. .env.local gibi dosyalarda tanımlanan değişkenler, varsayılan olarak yalnızca sunucu tarafında erişilebilirdir. Bu, API Rotaları (API Routes), Rota İşleyicileri (Route Handlers) ve Sunucu Bileşenleri (Server Components) gibi sunucuda çalışan kodlar tarafından güvenle kullanılabilecekleri anlamına gelir.6Bir ortam değişkeninin istemci tarafındaki JavaScript koduna dahil edilmesi gerekiyorsa, bu değişkenin adının NEXT_PUBLIC_ önekiyle başlaması zorunludur. Bu öneke sahip değişkenler, derleme sırasında istemciye gönderilen JavaScript paketine (bundle) gömülür ve tarayıcının geliştirici araçları kullanılarak herkes tarafından görülebilir hale gelir.7 Bu nedenle, Google Maps API anahtarı gibi hassas bir bilgiyi NEXT_PUBLIC_ önekli bir değişkende saklamak, anahtarın çalınması ve yetkisiz kullanımı için bir davetiye çıkarmakla eşdeğerdir. Bu raporda detaylandırılacak olan mimarinin temel prensibi, API anahtarını daima sunucu tarafında tutmak ve istemciye asla göndermemektir.1.2.2. Google Cloud Console Kısıtlamaları: İlk Savunma HattıAPI anahtarının güvenliğini sağlamanın ikinci katmanı, Google Cloud Console üzerinden uygulanacak kısıtlamalardır. Bu kısıtlamalar, anahtarın çalınması durumunda bile kullanım alanını ciddi şekilde sınırlar.5Uygulama Kısıtlamaları: Bu kısıtlamalar, anahtarın hangi kaynaklardan kullanılabileceğini tanımlar.HTTP Yönlendirenleri (HTTP referrers): Bu kısıtlama, anahtarın yalnızca belirtilen web alan adlarından (örneğin, *.yourdomain.com/*) gelen isteklerde kullanılmasını sağlar. Bu, özellikle Maps JavaScript API gibi istemci tarafında kullanılması zorunlu olan API'ler için kritik bir güvenlik önlemidir.IP Adresleri: Bu kısıtlama, anahtarın yalnızca belirtilen sunucu IP adreslerinden veya IP aralıklarından gelen isteklerde kullanılmasını sağlar. Bu, sunucu tarafında (örneğin bir Rota İşleyicisi içinde) yapılan tüm API çağrıları için en güvenli yöntemdir.API Kısıtlamaları: Bu ayar, API anahtarının hangi Google Cloud API'lerini çağırabileceğini sınırlar. "Anahtarı kısıtla" seçeneği seçilerek, anahtarın yalnızca bu proje için etkinleştirilen altı API (Directions, Places, Geocoding, vb.) için kullanılması sağlanmalıdır. Bu, anahtarın ele geçirilmesi durumunda, saldırganın bu anahtarı projenizde etkin olmayan diğer Google Cloud servisleri (örneğin, Compute Engine veya BigQuery) için kullanmasını engeller.5Bu iki kısıtlama türünün bir arada kullanılması, çok katmanlı bir güvenlik yaklaşımı oluşturur ve profesyonel bir uygulama için standart bir gerekliliktir.1.3. Next.js Projesi Kurulumu ve Gerekli KütüphanelerGüvenlik altyapısı anlaşıldıktan sonra, Next.js projesinin kendisi kurulmalıdır. Modern standartları ve bu raporda açıklanan sunucu odaklı mimariyi destekleyen App Router ile yeni bir proje oluşturulması şiddetle tavsiye edilir.4Proje oluşturulduktan sonra, Google Haritalarını React bileşenleri olarak yönetmek için bir kütüphane kurulmalıdır. Bu alanda en yaygın ve zengin özelliklere sahip seçeneklerden biri @react-google-maps/api kütüphanesidir. Bu kütüphane, harita, işaretçiler (markers), bilgi pencereleri (info windows) ve rota çizimi gibi karmaşık işlemleri basit React bileşenleri aracılığıyla yönetmeyi sağlar.3Proje kök dizininde aşağıdaki komutla kurulum yapılabilir:Bashnpm install @react-google-maps/api
Alternatif olarak, daha granüler kontrol isteyen veya daha hafif bir çözüm arayan geliştiriciler için Google'ın resmi @googlemaps/js-api-loader paketi 9 veya @vis.gl/react-google-maps gibi diğer modern kütüphaneler de 10 değerlendirilebilir. Ancak bu rapor, örneklerinde @react-google-maps/api kütüphanesini temel alacaktır.Bölüm 2: Next.js'te API Etkileşimi için Mimari StratejiDoğru altyapı kurulduktan sonraki adım, API çağrılarının uygulamanın "neresinde" ve "nasıl" yapılacağını belirleyen stratejiyi oluşturmaktır. Next.js'in modern mimarisi, güvenlik ve performansı optimize etmek için güçlü desenler sunar. Bu bölümde, uygulama boyunca kullanılacak olan temel mimari kararları ve desenleri tanımlanmaktadır.2.1. Sunucu Bileşenleri ve İstemci Bileşenleri: Modern Next.js ParadigmasıNext.js App Router ile birlikte gelen en temel yenilik, Sunucu Bileşenleri (Server Components) ve İstemci Bileşenleri (Client Components) arasındaki ayrımdır. Bu ayrımı anlamak, API anahtarını güvende tutmak ve yüksek performanslı bir uygulama oluşturmak için kritik öneme sahiptir.Sunucu Bileşenleri (Server Components): App Router'da varsayılan bileşen türüdür. Bu bileşenler tamamen sunucuda render edilir. Bu, veritabanları veya harici API'lerle doğrudan ve güvenli bir şekilde iletişim kurabilecekleri anlamına gelir. API anahtarları gibi hassas bilgileri istemciye ifşa etmeden kullanmak için ideal ortamdırlar.6 Sunucu Bileşenleri, istemciye gönderilen JavaScript miktarını azalttığı için sayfanın ilk yüklenme performansını (First Contentful Paint - FCP) önemli ölçüde iyileştirir.11İstemci Bileşenleri (Client Components): Etkileşimli kullanıcı arayüzleri oluşturmak için gereklidir. Bir bileşenin İstemci Bileşeni olması için dosyanın en başına "use client"; yönergesi eklenmelidir. Bu bileşenler, useState ve useEffect gibi React kancalarını (hooks), onClick gibi olay dinleyicilerini ve navigator.geolocation gibi yalnızca tarayıcıda bulunan API'leri kullanabilir.11 Bu bileşenler, sunucuda önceden render edildikten sonra istemciye gönderilir ve orada "hydrate" edilerek etkileşimli hale gelirler.12Bu iki bileşen türü arasındaki ayrım, Google Maps entegrasyonu için net bir yol haritası sunar: Veri çekme ve hassas işlemler sunucuda (Sunucu Bileşenleri veya Rota İşleyicileri) yapılmalı, haritanın görselleştirilmesi ve kullanıcı etkileşimi ise istemcide (İstemci Bileşenleri) gerçekleştirilmelidir.2.2. Sunucu Taraflı Proxy Deseni: Güvenlik için Altın StandartAPI anahtarını istemci tarafına göndermekten kaçınmanın en sağlam ve en güvenli yolu, Next.js'in yerleşik API katmanını bir proxy (vekil sunucu) olarak kullanmaktır. App Router'da bu, Rota İşleyicileri (Route Handlers) ile gerçekleştirilir (Pages Router'da ise API Rotaları kullanılır).7Bu desenin işleyişi şu şekildedir:İstemci Bileşeni (örneğin, bir arama kutusu), bir fetch isteğini doğrudan Google'ın API'sine değil, kendi Next.js uygulamasının içindeki bir uç noktaya (örneğin, /api/geocode) gönderir.Bu uç noktayı yöneten Rota İşleyicisi, isteği sunucu tarafında alır.Rota İşleyicisi, process.env üzerinden yalnızca sunucuda erişilebilen güvenli API anahtarını okur.Bu anahtarı ve istemciden gelen parametreleri (örneğin, aranacak adres) kullanarak asıl isteği Google Maps API'sinin gerçek uç noktasına yapar.Google'dan gelen yanıtı alır ve bu yanıtı istemci bileşenine geri döndürür.Bu yaklaşımın temel faydası nettir: Google Maps API anahtarı sunucu ortamını asla terk etmez. İstemcinin tarayıcısına hiçbir zaman gönderilmez, bu da onu ağ trafiğini dinleyen veya istemci kodunu inceleyen kötü niyetli kullanıcılardan tamamen korur.6 Bu desen, bu rapor kapsamında ele alınan tüm web servisi tabanlı API'ler (Directions, Geocoding, Roads, Geolocation ve Places web servisleri) için önerilen standart yaklaşımdır. Next.js'in bu yapısı, ayrı bir proxy sunucusu kurma ve yönetme karmaşıklığını ortadan kaldırır; çünkü proxy işlevselliği, çerçevenin doğal bir parçasıdır.2.3. Önerilen Mimari PlanAşağıdaki API Mimari Strateji Matrisi, her bir API için hangi Next.js özelliğinin ve güvenlik modelinin kullanılması gerektiğine dair geliştirici için hızlı bir başvuru kılavuzu sunar. Bu matris, kodlamaya başlamadan önce doğru mimari kararların alınmasını sağlayarak yaygın hataları önlemeyi amaçlamaktadır. Google Maps Platformu'nun web geliştiricileri için aslında iki ayrı platform gibi çalıştığı görülebilir: haritaları ve arayüz elemanlarını işlemek için kısıtlanmış, halka açık bir anahtar gerektiren İstemci Tarafı Görsel Platformu (Maps JavaScript API) ve ham veri sağlayan ve her zaman güvenli, yalnızca sunucuya özel bir anahtar aracılığıyla erişilmesi gereken Sunucu Tarafı Veri Platformu (Directions, Places vb. için web hizmeti uç noktaları). Bu iki alanı zihinsel olarak ayırmak, güvenli ve doğru bir uygulama oluşturmanın anahtarıdır.Tablo 1: API Mimari Strateji MatrisiAPI AdıÖnerilen DesenNext.js ÖzelliğiTemel GerekçeMaps JavaScript APIİstemci Tarafı Yüklemeİstemci Bileşeni ("use client")Tarayıcıda etkileşimli bir tuval (canvas) render eder; sunucuda render edilemez. Anahtar, HTTP Yönlendiren kısıtlaması ile korunmalıdır.Directions APISunucu Taraflı ProxyRota İşleyicisi / Sunucu Bileşeni fetchAnahtar güvenliği; kota hırsızlığına ve yetkisiz kullanıma karşı koruma sağlar.Places API (New)Sunucu Taraflı ProxyRota İşleyicisi / Sunucu Bileşeni fetchAnahtar güvenliği; kota hırsızlığına ve yetkisiz kullanıma karşı koruma sağlar.Geocoding APISunucu Taraflı ProxyRota İşleyicisi / Sunucu Bileşeni fetchAnahtar güvenliği; kota hırsızlığına ve yetkisiz kullanıma karşı koruma sağlar.Roads APISunucu Taraflı ProxyRota İşleyicisi / Sunucu Bileşeni fetchAnahtar güvenliği; kota hırsızlığına ve yetkisiz kullanıma karşı koruma sağlar.Geolocation APISunucu Taraflı ProxyRota İşleyicisi / Sunucu Bileşeni fetchAnahtar güvenliği; kota hırsızlığına ve yetkisiz kullanıma karşı koruma sağlar.Bölüm 3: API Uygulaması: Kapsamlı Bir Teknik KılavuzBu bölüm, raporun çekirdeğini oluşturur ve Bölüm 2'de belirlenen mimari desenleri takip ederek her bir API için ayrıntılı kod örnekleri ve açıklamalar sunar. Her örnek, güvenli, performanslı ve modern Next.js en iyi uygulamalarına uygun olarak tasarlanmıştır.3.1. Directions API: Rota Hesaplama ve GörselleştirmeDirections API, iki veya daha fazla nokta arasında yol tarifleri hesaplamak için kullanılır. Uygulamamızda, bu API'yi sunucu tarafında güvenli bir şekilde çağıracak ve sonucu istemcideki harita üzerinde görselleştireceğiz.3.1.1. Sunucu Tarafı Veri Çekme (Rota İşleyicisi)İlk olarak, istemciden gelen başlangıç ve bitiş noktalarını alıp Google Directions API'sine güvenli bir istek gönderen bir Rota İşleyicisi oluşturacağız.Dosya: app/api/directions/route.tsTypeScriptimport { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { origin, destination } = await request.json();

    if (!origin ||!destination) {
      return NextResponse.json(
        { error: 'Origin and destination are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('API key is not configured');
    }

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
      origin
    )}&destination=${encodeURIComponent(
      destination
    )}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status!== 'OK') {
      return NextResponse.json(
        { error: data.error_message |

| 'Failed to fetch directions' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Directions API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
Bu kod, /api/directions uç noktasına yapılan bir POST isteğini dinler. İsteğin gövdesinden origin ve destination alır, sunucu tarafındaki GOOGLE_MAPS_API_KEY ortam değişkenini kullanarak Google'a istek yapar ve sonucu istemciye geri döndürür.16 API anahtarı asla istemciye ifşa edilmez.3.1.2. İstemci Tarafı Rota ÇizimiŞimdi, bu Rota İşleyicisini çağıran ve dönen rota verisini harita üzerinde çizen bir İstemci Bileşeni oluşturacağız.Dosya: components/DirectionsMap.tsxTypeScript'use client';

import React, { useState, useEffect } from 'react';
import {
  GoogleMap,
  LoadScript,
  DirectionsService,
  DirectionsRenderer,
} from '@react-google-maps/api';

const mapContainerStyle = {
  height: '500px',
  width: '100%',
};

const center = {
  lat: 41.015137,
  lng: 28.979530, // Istanbul
};

interface DirectionsMapProps {
  origin: string;
  destination: string;
}

const DirectionsMap: React.FC<DirectionsMapProps> = ({ origin, destination }) => {
  const = useState<google.maps.DirectionsResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (origin && destination) {
      const fetchDirections = async () => {
        try {
          const response = await fetch('/api/directions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ origin, destination }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error |

| 'Failed to fetch directions');
          }

          const data = await response.json();
          setDirectionsResponse(data);
          setError(null);
        } catch (err: any) {
          setError(err.message);
          setDirectionsResponse(null);
        }
      };

      fetchDirections();
    }
  }, [origin, destination]);

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={10}>
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {directionsResponse && (
          <DirectionsRenderer options={{ directions: directionsResponse }} />
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default DirectionsMap;
Bu bileşen, origin ve destination propları değiştiğinde /api/directions uç noktasını çağırmak için useEffect kullanır. Dönen rota verisi directionsResponse state'inde saklanır ve @react-google-maps/api kütüphanesinden gelen <DirectionsRenderer /> bileşenine geçirilerek harita üzerinde otomatik olarak çizilir.8 Haritanın kendisini yüklemek için LoadScript bileşeninin bir API anahtarına ihtiyacı olduğuna dikkat edin. Bu, Bölüm 2'deki matriste belirtildiği gibi, HTTP yönlendiren kısıtlaması ile güvence altına alınmış bir NEXT_PUBLIC_ anahtarı olmalıdır.3.2. Places API Paketi: Analiz ve UygulamaPlaces API, milyonlarca yer hakkında zengin veritabanına erişim sağlar. Google, bu API'nin "Places API (New)" adında modernize edilmiş bir sürümünü sunmaktadır.3.2.1. Kritik Değerlendirme: Places API (Legacy) vs. Places API (New)Yeni bir projeye başlarken, hangi API sürümünün kullanılacağına dair bilinçli bir karar vermek esastır. Places API (New), eski sürüme göre önemli teknik ve mali avantajlar sunmaktadır ve bu nedenle tüm yeni uygulamalar için kesinlikle tercih edilmelidir.Eski API ile yeni API arasındaki en temel fark, FieldMasks (Alan Maskeleri) özelliğidir.18 Eski API'de bir yer detayı istediğinizde, genellikle o yerle ilgili mevcut tüm veriler (adres, telefon, yorumlar, fotoğraflar vb.) size gönderilir ve bu verilerin tamamı için ücretlendirilirsiniz. Places API (New) ise FieldMasks kullanarak yalnızca ihtiyacınız olan veri alanlarını (örneğin, sadece places.id, places.displayName, places.location) talep etmenize olanak tanır.19 Bu, hem API yanıt sürelerini önemli ölçüde hızlandırır hem de yalnızca talep ettiğiniz veri için faturalandırıldığınız için maliyetleri büyük ölçüde düşürür.18Ayrıca, yeni API'ler (Text Search (New) ve Nearby Search (New)), arama sonuçlarında tam yer ayrıntılarını döndürebilir, bu da genellikle ayrı bir Place Details isteği yapma ihtiyacını ortadan kaldırarak API çağrı sayısını ve karmaşıklığı azaltır.18 Son olarak, yeni API, elektrikli araç şarj istasyonu bilgileri, tekerlekli sandalye erişilebilirliği ve ödeme seçenekleri gibi daha modern ve zengin veri alanları sunar.18Tablo 2: Karşılaştırmalı Analiz: Places API (Legacy) vs. Places API (New)ÖzellikPlaces API (Legacy)Places API (New)"New" Sürümünün AvantajıVeri Alanı SeçimiHayır (tüm alanları döndürür)Evet (FieldMasks aracılığıyla)Daha düşük maliyet, daha hızlı yanıtlar.Maliyet ModeliGenellikle tüm veri için istek başına faturalandırılırYalnızca istenen veri alanları için faturalandırılırGranüler maliyet kontrolü, önemli tasarruf potansiyeli.API TasarımıArama sonrası ayrı bir Place Details çağrısı gerektirirArama sonuçları tam ayrıntıları içerebilirDaha az API çağrısı, daha basit kod mantığı.Mevcut VeriStandart alanlar (adres, telefon vb.)Tüm standart alanlar + EV şarj, erişilebilirlik vb.Daha zengin, daha modern ve kullanışlı veri setleri.Gelecek DesteğiEski (yeni özellik eklenmeyecek)Aktif olarak geliştiriliyor, yapay zeka özellikleri ekleniyorGeleceğe dönük, en son yeniliklere erişim.Bu karşılaştırma ışığında, bu raporun geri kalanındaki tüm Places API uygulamaları Places API (New) kullanılarak yapılacaktır.3.2.2. Uygulama: Place Autocomplete ve Place DetailsKullanıcıların adres veya yer adı yazarken anında öneriler almasını sağlayan Autocomplete ve seçilen yerin ayrıntılarını getiren Place Details, en yaygın kullanım senaryolarıdır.1. Autocomplete için Rota İşleyicisi:Dosya: app/api/places/autocomplete/route.tsTypeScriptimport { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { input } = await request.json();
    if (!input) {
      return NextResponse.json({ error: 'Input is required' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = 'https://places.googleapis.com/v1/places:autocomplete';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey!,
      },
      body: JSON.stringify({
        input: input,
        // İsteğe bağlı: Sonuçları belirli bir bölgeyle sınırlayabilirsiniz
        // locationRestriction: { circle: { center: { latitude: 41.0, longitude: 29.0 }, radius: 50000.0 } }
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Autocomplete API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
Bu işleyici, kullanıcı girdisini alır ve Google'ın Autocomplete (New) uç noktasına bir POST isteği gönderir.222. Place Details için Rota İşleyicisi:Dosya: app/api/places/details/route.tsTypeScriptimport { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { placeId } = await request.json();
    if (!placeId) {
      return NextResponse.json({ error: 'Place ID is required' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    // FieldMask kullanarak sadece ihtiyacımız olan alanları istiyoruz.
    const fields = 'id,displayName,formattedAddress,location';
    const url = `https://places.googleapis.com/v1/places/${placeId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey!,
        'X-Goog-FieldMask': fields,
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Place Details API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
Bu işleyici, Autocomplete'den alınan placeId'yi kullanarak Place Details (New) API'sini çağırır. X-Goog-FieldMask başlığı, maliyeti ve yanıt boyutunu optimize etmek için yalnızca belirli alanları talep etmemizi sağlar.193.3. Geocoding API: Adres ve Koordinat DönüşümüGeocoding API, adresleri coğrafi koordinatlara (enlem/boylam) ve tam tersini dönüştürmek için kullanılır. Bu API, özellikle veritabanındaki statik adresleri haritada işaretlemek gibi net ve belirsiz olmayan durumlar için idealdir.233.3.1. İleri Geocoding (Adresten Koordinata)Dosya: app/api/geocode/route.tsTypeScriptimport { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { address } = await request.json();
    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status!== 'OK') {
      return NextResponse.json(
        { error: data.error_message |

| 'Geocoding failed' },
        { status: 500 }
      );
    }
    
    // Genellikle ilk sonuç en alakalı olanıdır
    const location = data.results?.geometry.location;
    return NextResponse.json({ location });

  } catch (error) {
    console.error('Geocoding API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
Bu Rota İşleyicisi, bir adres dizesi alır, Google Geocoding API'sine bir GET isteği yapar ve bulunan ilk sonucun enlem ve boylamını döndürür.243.3.2. Ters Geocoding (Koordinattan Adrese)Ters geocoding için de benzer bir Rota İşleyicisi oluşturulabilir. Bu işleyici, enlem ve boylam alıp en yakın insan tarafından okunabilir adresi döndürür.233.4. Roads API: GPS Verilerini İyileştirmeRoads API, ham GPS izleme verilerini alıp bu noktaları en yakın yollara "yapıştırarak" (snap-to-road) daha doğru ve pürüzsüz bir rota geometrisi oluşturur. Bu, özellikle araç takip ve lojistik uygulamaları için değerlidir.25Dosya: app/api/roads/snap/route.tsTypeScriptimport { NextResponse } from 'next/server';

// Örnek: 'lat,lng|lat,lng|...' formatında bir path string'i bekler
export async function POST(request: Request) {
  try {
    const { path, interpolate = false } = await request.json();
    if (!path) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://roads.googleapis.com/v1/snapToRoads?path=${encodeURIComponent(
      path
    )}&interpolate=${interpolate}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
        return NextResponse.json({ error: data.error.message }, { status: data.error.code });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Roads API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
Bu işleyici, | karakteriyle ayrılmış enlem/boylam çiftlerinden oluşan bir path parametresi alır. interpolate parametresi true olarak ayarlandığında, API yolun geometrisini daha pürüzsüz hale getirmek için ara noktalar ekler.25 Bu, özellikle virajlarda ve tünellerde daha gerçekçi bir rota çizimi sağlar.3.5. Geolocation API: GPS Olmadan Konum TahminiGeolocation API, bir cihazın GPS sinyali olmadığında, çevresindeki hücre kuleleri ve Wi-Fi erişim noktası verilerini kullanarak konumunu tahmin etmeye yarar.28 Bu API, tarayıcının yerleşik navigator.geolocation özelliğinden farklıdır ve genellikle IoT cihazları veya GPS'i olmayan mobil cihazlar için kullanılır.İstek, bir POST metodu ile ve JSON formatında bir gövde ile yapılır.Dosya: app/api/geolocation/route.tsTypeScriptimport { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // İstek gövdesi, 'cellTowers', 'wifiAccessPoints' gibi nesneleri içermelidir.
    const requestBody = await request.json();

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://www.googleapis.com/geolocation/v1/geolocate?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    
    if (data.error) {
        return NextResponse.json({ error: data.error.message }, { status: data.error.code });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Geolocation API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
Bu işleyiciye gönderilecek requestBody, Google'ın dokümantasyonunda belirtilen cellTowers ve wifiAccessPoints dizileri gibi yapıları içermelidir.28 Örnek bir curl isteği şu şekilde olabilir:Bashcurl -d '{
  "considerIp": "true",
  "wifiAccessPoints":
}' -H "Content-Type: application/json" -X POST "https://www.googleapis.com/geolocation/v1/geolocate?key=YOUR_API_KEY"
Bölüm 4: Gelişmiş React Desenleri ve Kullanıcı DeneyimiAPI'leri güvenli ve doğru bir şekilde çağırmak, denklemin sadece bir yarısıdır. Diğer yarısı ise bu asenkron işlemlerin sonuçlarını kullanıcıya akıcı, anlaşılır ve hatasız bir şekilde sunmaktır. Bu bölüm, harita verilerini yönetmek ve kullanıcı deneyimini iyileştirmek için temel React desenlerine odaklanmaktadır.4.1. Coğrafi Veriler için React Kancaları ile Durum YönetimiReact'in temel taşları olan useState ve useEffect kancaları, API'lerden gelen verileri yönetmek için güçlü araçlardır.useState: API'den dönen yanıtları (örneğin, bir rota nesnesi, yer detayları listesi veya koordinatlar) bileşenin durumunda (state) saklamak için kullanılır. Bu durum her değiştiğinde, bileşen yeniden render edilir ve arayüz güncellenir.29useEffect: Veri çekme işlemini tetiklemek için kullanılır. Genellikle, bileşenin propları (örneğin, yeni bir varış noktası) değiştiğinde veya bileşen ilk kez yüklendiğinde API çağrısı yapmak için idealdir.30 Bağımlılık dizisi (dependency array) doğru şekilde yönetilerek gereksiz API çağrılarının önüne geçilir.Harita uygulamalarında durum yönetimi genellikle iki kategoriye ayrılır:Harita Durumu: Haritanın kendisiyle ilgili durumlar; center (merkez nokta), zoom (yakınlaştırma seviyesi) gibi.Veri Durumu: Harita üzerinde gösterilen verilerle ilgili durumlar; markers (işaretçiler dizisi), polylines (rota çizgileri), directionsResponse (yol tarifi verisi) gibi.Bu durumları ayrı useState kancalarıyla yönetmek, kodun daha okunabilir ve yönetilebilir olmasını sağlar.4.2. Akıcı Bir Kullanıcı Deneyimi Sağlama: Yükleme ve Hata DurumlarıAPI çağrıları doğası gereği asenkrondur; zaman alırlar ve başarısız olabilirler. Kullanıcı arayüzü bu iki olasılığı da her zaman hesaba katmalıdır. Kullanıcı bir butona tıkladığında anında geri bildirim almazsa veya bir hata oluştuğunda boş bir ekranla karşılaşırsa, bu kötü bir kullanıcı deneyimi yaratır.31Bu nedenle, her veri çeken bileşen için standart bir durum yönetim deseni benimsenmelidir. Bu desen, verinin yaşam döngüsünü (boşta, yükleniyor, başarılı, hatalı) modellemeye dayanır.const = useState(null);const [isLoading, setIsLoading] = useState(false);const [error, setError] = useState(null);Bu üç useState kancası, veri çekme işleminin her aşamasını yönetmek için yeterlidir.32Uygulama Deseni:API çağrısı başlamadan hemen önce, setIsLoading(true) ve setError(null) çağrılır. Bu, arayüzde bir yükleme göstergesinin (spinner gibi) belirmesini sağlar ve önceki hataları temizler.API isteği bir try...catch bloğu içine alınır.İstek başarılı olursa, try bloğunda gelen veri setData(response) ile duruma kaydedilir.İstek başarısız olursa, catch bloğunda hata yakalanır ve setError(error.message) ile hata durumu güncellenir.Son olarak, try ve catch bloklarından sonra (veya bir finally bloğu içinde), setIsLoading(false) çağrılarak yükleme göstergesi kaldırılır.Aşağıda, bu deseni uygulayan tam bir React bileşeni örneği bulunmaktadır:Dosya: components/DataFetcher.tsxTypeScript'use client';

import React, { useState, useEffect } from 'react';

function DataFetcher() {
  const = useState<any>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('https://api.example.com/data'); // Örnek API
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        const json = await res.json();
        setData(json.results);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  },); // Sadece bileşen yüklendiğinde çalışır

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <ul>
      {data.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}

export default DataFetcher;
Bu desen, sadece "hoş bir özellik" değil, profesyonel kalitede, sağlam ve kullanıcı dostu arayüzler oluşturmak için temel bir gerekliliktir.31Bölüm 5: Operasyonel Yönetim ve Maliyet KontrolüBir uygulamanın geliştirilmesi, kodun yazılmasıyla bitmez. Uzun vadeli başarı, uygulamanın performansını, kullanımını ve maliyetlerini sürekli olarak izlemeyi ve yönetmeyi gerektirir. Bu son bölüm, geliştirme sürecinden uzun vadeli bakıma geçişi ele alarak, Google Maps Platform entegrasyonunun operasyonel yönlerine odaklanmaktadır.5.1. Google Cloud Console'da Kullanımı ve Kotaları İzlemeGoogle Cloud Console, API kullanımını izlemek için güçlü araçlar sunar. "Google Maps Platform" > "Metrikler" sayfası, projenizin API kullanımına ilişkin ayrıntılı bir genel bakış sağlar. Bu sayfa, mühendisin aşağıdaki gibi kritik soruları yanıtlamasına olanak tanır:Hangi API'ler en çok kullanılıyor?Kullanım zamanla nasıl bir eğilim gösteriyor (artıyor mu, azalıyor mu)?Hataların oranı nedir?Metrikler, API'ye ve daha da önemlisi, kimlik bilgisine (credential_id) göre filtrelenebilir. Bu, tek bir API anahtarı kullanıldığında, hangi API'nin ne kadar tüketim yaptığını net bir şekilde görmeyi sağlar.5 Bu izleme, performans darboğazlarını veya beklenmedik kullanım artışlarını proaktif olarak tespit etmek için hayati önem taşır.Ayrıca, her API'nin belirli kullanım kotaları vardır. Örneğin, bazı API'lerin dakika başına istek limiti olabilir.33 "Google Maps Platform" > "Kotalar" sayfasından, projenizin her bir API için geçerli olan kotalarını ve mevcut kullanımınızı görebilirsiniz. Kotalara yaklaşmak, uygulamanızın ölçeklenmesiyle ilgili potansiyel sorunların erken bir göstergesi olabilir.5.2. Proaktif Maliyet Kontrolü: Faturalandırma Bütçeleri ve Uyarıları UygulamaGoogle Maps Platformu, kullandıkça öde modeline dayalı bir hizmettir.1 Bu, optimize edilmemiş kodun, bir güvenlik açığının veya beklenmedik bir popülerlik artışının faturalarda sürpriz artışlara yol açabileceği anlamına gelir. Bu riski yönetmek için, mühendislik ekibinin maliyet kontrolünü bir iş sorumluluğu olarak görmesi ve proaktif önlemler alması gerekir.Google Cloud Console'un "Faturalandırma" > "Bütçeler ve uyarılar" bölümü, bu kontrolü sağlamak için tasarlanmış temel bir araçtır.34 Bu aracı kullanarak bir bütçe ve uyarı sistemi kurmak, dağıtım sürecinin zorunlu bir adımı olarak kabul edilmelidir.Bütçe ve Uyarı Kurulum Adımları:Bütçe Oluşturma: "Bütçeler ve uyarılar" sayfasına gidin ve "Bütçe Oluştur"a tıklayın.36Kapsam Belirleme: Bütçenin hangi harcamaları izleyeceğini seçin. Bu, tüm faturalandırma hesabı, belirli bir proje veya hatta belirli hizmetler (örneğin, sadece Directions API) olabilir.Tutar Belirleme: Bütçe için bir hedef tutar belirleyin (örneğin, aylık 200 USD). Bu, Google'ın sunduğu ücretsiz krediler dahilinde kalmak için bir başlangıç noktası olabilir.34Uyarı Eşik Kurallarını Yapılandırma: Bu en kritik adımdır. Bütçenin belirli yüzdelerine ulaşıldığında e-posta bildirimleri tetikleyecek kurallar tanımlayın (örneğin, %50, %90 ve %100).35Gerçekleşen ve Tahmin Edilen Harcama: Uyarıların "Gerçekleşen" (Actual) harcamaya mı yoksa "Tahmin Edilen" (Forecasted) harcamaya mı dayalı olacağını seçebilirsiniz.Gerçekleşen: Harcama, belirlenen eşiği fiilen aştığında bir uyarı gönderir.Tahmin Edilen: Mevcut harcama eğilimine göre, bütçe döneminin sonunda eşiği aşacağınız tahmin edildiğinde bir uyarı gönderir. Bu, sorunları daha oluşmadan tespit etmek için çok güçlü bir proaktif araçtır.35Bu uyarıları ayarlamak, maliyet yönetimini finans departmanının reaktif bir görevi olmaktan çıkarıp, mühendislik ekibinin proaktif, gerçek zamanlı bir sorumluluğuna dönüştürür. Kodda alınan mimari kararların (örneğin, FieldMasks kullanmak) faturaya doğrudan ve ölçülebilir bir etkisi vardır. Otomatikleştirilmiş uyarılar, bu etkinin sürekli olarak izlenmesini sağlar ve bütçe aşımlarına karşı bir mühendislik çözümü sunar.Sonuç ve ÖnerilerBu rapor, Google Maps Platform API'lerinin bir Next.js uygulamasına entegrasyonu için kapsamlı bir yol haritası sunmuştur. Başarılı bir uygulama için geliştirme ekibinin aşağıdaki temel ilkelere uyması kritik öneme sahiptir:Güvenliği Önceliklendirin: API anahtarı güvenliği, projenin temel taşıdır. Sunucu taraflı proxy deseni (Rota İşleyicileri kullanarak) standart olarak benimsenmeli ve API anahtarı istemci tarafına asla ifşa edilmemelidir. Google Cloud Console'daki uygulama ve API kısıtlamaları, bu güvenliği pekiştiren vazgeçilmez bir katmandır.Modern Mimariden Yararlanın: Next.js'in Sunucu Bileşenleri ve İstemci Bileşenleri ayrımı, güvenlik ve performansı optimize etmek için doğal bir yapı sunar. Veri çekme işlemleri sunucuda, etkileşimli görselleştirmeler ise istemcide yapılmalıdır. Bu "sunucuda çek, istemcide render et" felsefesi, projenin mimari temelini oluşturmalıdır.Places API (New) Sürümünü Kullanın: Maliyetleri düşürmek, performansı artırmak ve daha zengin veri setlerine erişmek için eski Places API yerine kesinlikle Places API (New) tercih edilmelidir. FieldMasks özelliğinin etkin kullanımı, maliyet optimizasyonunun anahtarıdır.Kullanıcı Deneyimini İyileştirin: Asenkron veri çekme işlemlerinin doğası gereği, yükleme ve hata durumları her zaman yönetilmelidir. Standart bir isLoading ve error durum yönetimi deseni, uygulamanın profesyonel ve kullanıcı dostu olmasını sağlar.Operasyonel Sorumluluk Alın: Geliştirme, kodun dağıtılmasıyla sona ermez. API kullanımını düzenli olarak izlemek ve proaktif maliyet kontrolü için faturalandırma bütçeleri ve uyarıları ayarlamak, uygulamanın uzun vadeli sağlığı ve sürdürülebilirliği için zorunludur.Bu ilkelere bağlı kalmak, yalnızca teknik olarak sağlam değil, aynı zamanda güvenli, verimli ve maliyet etkin bir coğrafi bilgi sistemi uygulamasının geliştirilmesini sağlayacaktır.