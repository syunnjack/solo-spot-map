import { useMemo, useState } from 'react'
import './App.css'

const savedKey = 'solo-spot-map.saved'

const areas = ['すべて', '名古屋', '静岡', '大阪', '東京']
const categories = ['すべて', 'カフェ', '喫煙', '漫画喫茶', '深夜飲食', '作業場所', '休憩']

const spots = [
  {
    id: 'meieki-cafe-power',
    name: '名駅ソロワークカフェ',
    area: '名古屋',
    station: '名古屋',
    category: 'カフェ',
    walk: 4,
    price: 580,
    stay: 45,
    rating: 4.4,
    open: '07:00-23:00',
    smoking: false,
    power: true,
    late: true,
    soloFriendly: true,
    singleCharge: false,
    crowd: 'やや混雑',
    tags: ['一人席多め', '電源', '短時間OK'],
    note: 'バス到着後や打ち合わせ前の時間調整に向く、入口が広く一人で入りやすいカフェ。',
  },
  {
    id: 'sakae-smoke-booth',
    name: '栄地下街スモークブース',
    area: '名古屋',
    station: '栄',
    category: '喫煙',
    walk: 2,
    price: 0,
    stay: 8,
    rating: 4.0,
    open: '08:00-22:30',
    smoking: true,
    power: false,
    late: false,
    soloFriendly: true,
    singleCharge: false,
    crowd: '空き',
    tags: ['無料', '駅近', '短時間'],
    note: '番号待ちや乗換前に使える喫煙スポット。長居よりも短時間利用向き。',
  },
  {
    id: 'shizuoka-net-cafe',
    name: '静岡駅南ナイトラウンジ',
    area: '静岡',
    station: '静岡',
    category: '漫画喫茶',
    walk: 5,
    price: 1200,
    stay: 90,
    rating: 4.1,
    open: '24時間',
    smoking: true,
    power: true,
    late: true,
    soloFriendly: true,
    singleCharge: false,
    crowd: '通常',
    tags: ['シャワー', '仮眠', '喫煙席あり'],
    note: '高速バス到着後の仮眠、シャワー、スマホ充電までまとめて済ませられる。',
  },
  {
    id: 'osaka-counter-diner',
    name: '梅田ひとりカウンター食堂',
    area: '大阪',
    station: '梅田',
    category: '深夜飲食',
    walk: 6,
    price: 980,
    stay: 35,
    rating: 4.2,
    open: '11:00-02:00',
    smoking: false,
    power: false,
    late: true,
    soloFriendly: true,
    singleCharge: false,
    crowd: '通常',
    tags: ['カウンター', '深夜', '定食'],
    note: '一人客が多いカウンター中心の店。夜着後の食事に使いやすい。',
  },
  {
    id: 'tokyo-charge-bar',
    name: '新宿ミニバー スタンディング',
    area: '東京',
    station: '新宿',
    category: '深夜飲食',
    walk: 7,
    price: 1800,
    stay: 40,
    rating: 3.7,
    open: '18:00-03:00',
    smoking: true,
    power: false,
    late: true,
    soloFriendly: false,
    singleCharge: true,
    crowd: '混雑',
    tags: ['深夜', '喫煙可', 'チャージ注意'],
    note: '一人でも入れるが、シングルチャージがあるため短時間利用には注意。',
  },
  {
    id: 'nagoya-rest-space',
    name: '名駅リカバリーサウナ',
    area: '名古屋',
    station: '名古屋',
    category: '休憩',
    walk: 9,
    price: 1800,
    stay: 75,
    rating: 4.3,
    open: '06:00-24:00',
    smoking: false,
    power: true,
    late: true,
    soloFriendly: true,
    singleCharge: false,
    crowd: 'やや混雑',
    tags: ['朝着向け', '充電', '休憩'],
    note: '夜行バス明け、出勤前、イベント前の回復に使える一人向け休憩スポット。',
  },
]

function readSaved() {
  try {
    return JSON.parse(localStorage.getItem(savedKey)) ?? {}
  } catch {
    return {}
  }
}

function formatYen(value) {
  return value === 0
    ? '無料'
    : new Intl.NumberFormat('ja-JP', {
        style: 'currency',
        currency: 'JPY',
        maximumFractionDigits: 0,
      }).format(value)
}

function App() {
  const [query, setQuery] = useState('名古屋')
  const [area, setArea] = useState('すべて')
  const [category, setCategory] = useState('すべて')
  const [requirements, setRequirements] = useState({ smoking: false, power: true, late: false, noCharge: true })
  const [saved, setSaved] = useState(readSaved)

  const filteredSpots = useMemo(() => {
    const text = query.trim().toLowerCase()
    return spots
      .filter((spot) => area === 'すべて' || spot.area === area)
      .filter((spot) => category === 'すべて' || spot.category === category)
      .filter((spot) => !requirements.smoking || spot.smoking)
      .filter((spot) => !requirements.power || spot.power)
      .filter((spot) => !requirements.late || spot.late)
      .filter((spot) => !requirements.noCharge || !spot.singleCharge)
      .filter((spot) => {
        const haystack = `${spot.name} ${spot.area} ${spot.station} ${spot.category} ${spot.tags.join(' ')} ${spot.note}`.toLowerCase()
        return !text || haystack.includes(text)
      })
      .sort((a, b) => Number(b.soloFriendly) - Number(a.soloFriendly) || b.rating - a.rating || a.walk - b.walk)
  }, [area, category, query, requirements])

  const displaySpots = filteredSpots.length ? filteredSpots : spots
  const bestSpot = displaySpots[0]
  const savedCount = Object.values(saved).filter(Boolean).length
  const avgPrice = Math.round(displaySpots.reduce((sum, spot) => sum + spot.price, 0) / Math.max(displaySpots.length, 1))

  const toggleRequirement = (key) => {
    setRequirements((current) => ({ ...current, [key]: !current[key] }))
  }

  const toggleSaved = (spotId) => {
    setSaved((current) => {
      const next = { ...current, [spotId]: !current[spotId] }
      localStorage.setItem(savedKey, JSON.stringify(next))
      return next
    })
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <span className="brand">Solo Spot Map</span>
          <h1>一人で入りやすい場所だけ、迷わず探す。</h1>
          <p>喫煙可、電源あり、深夜営業、シングルチャージなし。一人利用で本当に知りたい条件をまとめて比較できます。</p>
        </div>
        <aside className="quick-card">
          <span>いまのおすすめ</span>
          <strong>{bestSpot.name}</strong>
          <p>{bestSpot.station}駅 徒歩{bestSpot.walk}分 / {formatYen(bestSpot.price)} / {bestSpot.open}</p>
        </aside>
      </header>

      <section className="search-panel" aria-label="ソロスポット検索">
        <label>
          地域・駅・用途
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="例: 名古屋、喫煙、深夜、電源" />
        </label>
        <label>
          エリア
          <select value={area} onChange={(event) => setArea(event.target.value)}>
            {areas.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          種別
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </section>

      <section className="requirement-row" aria-label="条件フィルター">
        <button type="button" className={requirements.smoking ? 'active' : ''} onClick={() => toggleRequirement('smoking')}>喫煙可</button>
        <button type="button" className={requirements.power ? 'active' : ''} onClick={() => toggleRequirement('power')}>電源あり</button>
        <button type="button" className={requirements.late ? 'active' : ''} onClick={() => toggleRequirement('late')}>深夜営業</button>
        <button type="button" className={requirements.noCharge ? 'active' : ''} onClick={() => toggleRequirement('noCharge')}>チャージなし</button>
      </section>

      <section className="summary-grid" aria-label="検索サマリー">
        <article>
          <span>候補</span>
          <strong>{displaySpots.length}</strong>
        </article>
        <article>
          <span>平均予算</span>
          <strong>{formatYen(avgPrice)}</strong>
        </article>
        <article>
          <span>保存済み</span>
          <strong>{savedCount}</strong>
        </article>
      </section>

      <section className="content-grid">
        <div className="spot-list" aria-label="スポット一覧">
          {displaySpots.map((spot) => (
            <article className={spot.singleCharge ? 'spot-card caution' : 'spot-card'} key={spot.id}>
              <div className="spot-main">
                <span className="type-pill">{spot.category}</span>
                <h2>{spot.name}</h2>
                <p>{spot.note}</p>
              </div>
              <div className="metric-row">
                <span>{spot.station}駅 徒歩{spot.walk}分</span>
                <span>{formatYen(spot.price)}</span>
                <span>滞在目安 {spot.stay}分</span>
                <span>評価 {spot.rating}</span>
              </div>
              <div className="tag-row">
                {spot.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
                {spot.singleCharge && <span className="warning">シングルチャージ注意</span>}
              </div>
              <div className="card-actions">
                <button type="button" onClick={() => toggleSaved(spot.id)}>{saved[spot.id] ? '保存済み' : '保存する'}</button>
                <a href={`https://www.google.com/maps/search/${encodeURIComponent(`${spot.area} ${spot.name}`)}`} target="_blank" rel="noreferrer">
                  地図で開く
                </a>
              </div>
            </article>
          ))}
        </div>

        <aside className="side-panel">
          <h2>一人利用チェック</h2>
          <div className="check-list">
            <span>入口で一人利用が浮かない</span>
            <span>カウンター席または一人席がある</span>
            <span>チャージ・2名条件が明記されている</span>
            <span>喫煙場所と禁煙席が分かれている</span>
            <span>深夜でも駅へ戻りやすい</span>
          </div>
          <div className="map-card" aria-label="簡易マップ">
            <span className="node station">駅</span>
            <span className="line" />
            <span className="node spot">候補</span>
            <span className="line" />
            <span className="node back">戻る</span>
          </div>
        </aside>
      </section>
    </main>
  )
}

export default App
