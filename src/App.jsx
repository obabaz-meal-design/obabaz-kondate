import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, RotateCcw, Utensils, Heart, Sparkles, Menu, X } from 'lucide-react';
import { STEPS, INGREDIENT_CATEGORIES, COOKING_METHODS, SEASONINGS, ARRANGEMENTS, OBABAZ_TIPS } from './constants/steps';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export default function App() {
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({
        main: '',
        mainOther: '',
        vegetables: [],
        vegetablesOther: '',
        staple: '',
        stapleOther: '',
        stapleTemp: '温製',
        method: '',
        methodOther: '',
        umami: '',
        umamiOther: '',
        salt: '',
        saltOther: '',
        arrangements: {}, // Changed to object: { categoryId: option }
        arrangementsOther: {}, // { categoryId: text }
    });
    const [activeArrangementCategory, setActiveArrangementCategory] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showModal, setShowModal] = useState(null); // 'about' | 'terms' | 'privacy' | null
    const otherInputRef = useRef(null);

    useEffect(() => {
        if (otherInputRef.current) {
            otherInputRef.current.focus();
        }
    }, [formData.salt, activeArrangementCategory, formData.arrangements]);

    const nextStep = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
    const prevStep = () => setStep((s) => Math.max(s - 1, 0));
    const reset = () => {
        setStep(0);
        setFormData({
            main: '',
            mainOther: '',
            vegetables: [],
            vegetablesOther: '',
            staple: '',
            stapleOther: '',
            stapleTemp: '温製',
            method: '',
            methodOther: '',
            umami: '',
            umamiOther: '',
            salt: '',
            saltOther: '',
            arrangements: {},
            arrangementsOther: {},
        });
        setActiveArrangementCategory(null);
    };

    const toggleVegetable = (v) => {
        setFormData(prev => ({
            ...prev,
            vegetables: prev.vegetables.includes(v)
                ? prev.vegetables.filter(item => item !== v)
                : prev.vegetables.length < 3 ? [...prev.vegetables, v] : prev.vegetables
        }));
    };

    const selectArrangementOption = (categoryId, option) => {
        setFormData(prev => ({
            ...prev,
            arrangements: {
                ...prev.arrangements,
                [categoryId]: option
            }
        }));
    };

    const removeArrangement = (categoryId) => {
        setFormData(prev => {
            const newArr = { ...prev.arrangements };
            delete newArr[categoryId];
            return { ...prev, arrangements: newArr };
        });
    };

    const getDisplayName = (key, otherKey) => {
        const val = formData[key];
        if (val === 'その他') return formData[otherKey] || 'お好みのもの';
        return val;
    };

    const getArrangementDisplayName = (categoryId) => {
        const opt = formData.arrangements[categoryId];
        if (opt === 'その他') return formData.arrangementsOther[categoryId] || 'お好み';
        return opt;
    };

    const generateRecipe = () => {
        const mainName = getDisplayName('main', 'mainOther');
        const vegNames = formData.vegetables.map(v => v === 'その他' ? (formData.vegetablesOther || 'お野菜') : v);
        const stapleName = getDisplayName('staple', 'stapleOther');
        const method = getDisplayName('method', 'methodOther');
        const umami = getDisplayName('umami', 'umamiOther');
        const salt = getDisplayName('salt', 'saltOther');
        const { arrangements } = formData;

        // Appetizing Title Generation - Fixed Logic
        let title = "";
        const vegPart = vegNames.length > 0 ? vegNames.join('と') : "";
        const mainPart = mainName ? mainName : "";

        if (stapleName && stapleName !== '無し（おかずのみ）') {
            const base = vegPart && mainPart ? `${mainPart}と${vegPart}` : (mainPart || vegPart);
            title = `${base}で仕立てる、絶品${stapleName}`;
        } else {
            const base = vegPart && mainPart ? `${vegPart}と${mainPart}` : (vegPart || mainPart);
            title = `素材の旨味を閉じ込めた、${base}の${method}`;
        }

        const tips = OBABAZ_TIPS[Math.floor(Math.random() * OBABAZ_TIPS.length)];

        // --- Step 1: Preparation ---
        let prep = "";
        const prepVeggies = vegNames.length > 0 ? `${vegNames.join('、')}は食感を活かすように丁寧に切り分けましょう。` : "";
        if (mainName.includes('肉')) {
            prep = `${mainName}は室温に戻してから、表面の水分を拭き取ると旨味が逃げませんよ。${prepVeggies}`;
        } else if (mainName.includes('魚') || mainName.includes('シーフード')) {
            prep = `${mainName}は下処理を丁寧に行い、臭みがないよう準備しましょうね。${prepVeggies}`;
        } else if (mainName.includes('卵')) {
            prep = `卵はボウルに割り、白身を切るようにリズムよく割りほぐすのが、ふんわり仕上げるコツです。${prepVeggies}`;
        } else if (mainName.includes('豆腐')) {
            prep = `豆腐は水気をしっかり切って、崩れないよう愛しむように切り分けましょう。${prepVeggies}`;
        } else {
            prep = `${mainName}と${vegNames.join('と')}を準備しましょう。食材の顔ぶれを見るだけで、ワクワクしますね。`;
        }

        // --- Step 2: Cooking Action ---
        let cooking = "";
        const sensory = {
            '炒める': "フライパンで手早く、シャキシャキ感を残すように強火で一気に仕上げていきます。パチパチという音が「美味しい合図」ですよ。",
            '煮る': "お鍋でじっくり、味が染み渡るようにコトコトと見守ってください。優しい湯気が台所を包み込みます。",
            '焼く': "表面においしそうな「焼き色」がつくまで、じっと我慢して焼いてくださいね。香ばしい香りが漂ってきます。",
            '生（和える）': "素材の鮮度を活かし、ボウルの中で調味料と優しく馴染ませましょう。しっとりとした輝きが食欲をそそります。",
            '茹でる': "たっぷりのお湯の中で、食材たちが弾むように踊るのを見守ってください。火が通る瞬間の色の変化が美しいですよ。",
            '蒸す': "蓋の下で食材の甘みが最大限に引き出されるのを待ちましょう。開けた瞬間の真っ白な湯気が、最高のご馳走です。",
            '揚げる': "油の中で軽やかな音が響き、表面がカリッと黄金色に輝く瞬間を逃さないでくださいね。"
        };

        if (formData.stapleTemp === '冷製') {
            cooking = `食材を${method}た後は、氷水でキュッと締めて、涼やかな一皿に仕立てましょう。瑞々しい輝きが、食卓に涼を呼び込みますよ。`;
        } else {
            cooking = sensory[method] || `${method}を丁寧に進めていきましょう。`;
        }

        // --- Step 3: Flavor & Staple Integration ---
        let flavor = "";
        const stapleText = stapleName && stapleName !== '無し（おかずのみ）' ? `これを${stapleName}に合わせれば、ボリューム満点の一品になりますよ。` : "";

        if (formData.stapleTemp === '冷製') {
            flavor = `${umami}の冷たいお出汁に、${salt}をキリッと効かせて。${stapleText}素材の芯まで冷えゆく心地よさを大切にしましょう。`;
        } else {
            flavor = `${umami}の深いコクに、${salt}で味の輪郭を整えます。${stapleText}味が食材の奥まで染み込んでいく様子を想像してくださいね。`;
        }

        // --- Step 4: Final Touch & Arrangements ---
        let finalTouch = "";
        const arrEntries = Object.entries(arrangements);
        if (arrEntries.length > 0) {
            const arrDescriptions = arrEntries.map(([id, opt]) => {
                const cat = ARRANGEMENTS.find(c => c.id === id);
                const disp = opt === 'その他' ? (formData.arrangementsOther[id] || 'お好み') : opt;
                return `${cat ? cat.label : ''}の${disp}`;
            });
            finalTouch = `仕上げに${arrDescriptions.join('や')}を添えます。香りが静かに広がり、彩りが加わることで、素材たちがより輝き始めます。`;
        } else {
            finalTouch = "最後は器との調和を考え、静かに整えます。出来立ての香りを大切に、そっと食卓へ運びましょう。";
        }

        // --- Step 5: Completion ---
        let completion = `感謝を込めて盛り付けます。台所から食卓へ、温かな記憶を繋ぐ時間。さあ、冷めないうちに「いただきます」のご挨拶を。`;

        return {
            title,
            description: `選び抜かれた食材と${method}の技がひとつになった一皿。心まで温まる、今日だけの特別な時間をどうぞ。`,
            steps: [prep, cooking, flavor, finalTouch, completion],
            tip: tips,
            // Prompt for AI
            prompt: `あなたは経験豊富な料理人です。提供された食材と条件をもとに、作る人の心に寄り添う、温かみのある丁寧な言葉遣いでレシピを執筆してください。

【材料】
- メイン：${mainName}
- 野菜：${vegNames.join('、')}
- 主食：${stapleName}（${formData.stapleTemp}）

【調理方針】
- 調理法：${method}
- 味のベース：${umami}
- 仕上げの味：${salt}
- アレンジ：${arrEntries.map(([id, opt]) => opt === 'その他' ? (formData.arrangementsOther[id] || 'お好み') : opt).join('、')}

【要望】
- ステップごとの丁寧な解説を含めてください。
- プロならではのコツや、美味しくなる一工夫を添えてください。
- 読んだ人が温かい気持ちになれるような文章で記述してください。`
        };
    };

    const recipe = step === 5 ? generateRecipe() : null;

    return (
        <div className="min-h-screen bg-[#F6E7A6] text-obabaz-earth-900 font-sans overflow-x-hidden">
            {/* Header and Step Indicator - Semi-Sticky Container */}
            <div className="sticky top-0 z-[100] bg-[#F6E7A6]/80 backdrop-blur-md px-4 pt-4">
                <header className="max-w-2xl mx-auto py-4 flex items-center justify-between relative">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col items-start overflow-hidden"
                    >
                        <div className="flex items-center gap-2">
                            <Utensils className="w-6 h-6 md:w-8 md:h-8 text-obabaz-warm-600 flex-shrink-0" />
                            <h1 className="text-xl md:text-3xl font-bold text-obabaz-warm-600 truncate leading-none">obabaz 献立帖</h1>
                        </div>
                        <p className="text-obabaz-earth-500 italic text-[10px] md:text-sm truncate ml-8 md:ml-10 mt-1">〜 旬を愛で、手間を慈しむ台所から 〜</p>
                    </motion.div>

                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="w-12 h-12 flex items-center justify-center transition-all active:scale-90 flex-shrink-0 bg-transparent border-0 shadow-none outline-none appearance-none p-0"
                        aria-label="メニューを開く"
                    >
                        <Menu className="w-8 h-8 text-obabaz-warm-600" />
                    </button>
                </header>

                {/* Step Indicator */}
                <div className="max-w-2xl mx-auto flex justify-between mb-4 overflow-x-auto pb-2 px-2 custom-scrollbar-hide">
                    {STEPS.map((s, idx) => (
                        <div key={s.id} className="flex flex-col items-center min-w-[55px] md:min-w-[70px]">
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-1 transition-all shadow-sm",
                                idx <= step ? "bg-obabaz-warm-500 text-white" : "bg-white border border-obabaz-earth-200 text-obabaz-earth-300"
                            )}>
                                {idx + 1}
                            </div>
                            <span className={cn(
                                "text-[9px] md:text-xs whitespace-nowrap text-center",
                                idx === step ? "text-obabaz-warm-700 font-bold" : "text-obabaz-earth-400"
                            )}>
                                {s.title}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <main className="max-w-2xl mx-auto p-4">

                <div className="glass-panel p-6 md:p-10 rounded-[2.5rem] min-h-[450px] flex flex-col relative overflow-hidden">
                    {/* Subtle background decoration */}
                    <div className="absolute -top-24 -left-24 w-48 h-48 bg-obabaz-warm-100 rounded-full blur-3xl opacity-50" />
                    <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-obabaz-warm-100 rounded-full blur-3xl opacity-50" />

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex-grow z-10"
                        >
                            <h2 className="text-2xl font-bold mb-2 text-obabaz-earth-800 flex items-center gap-2">
                                {step === 5 && <Sparkles className="w-6 h-6 text-obabaz-warm-400" />} {STEPS[step].title}
                            </h2>
                            <p className="text-obabaz-earth-600 mb-8 leading-relaxed">
                                {STEPS[step].description}
                            </p>

                            {step === 0 && (
                                <div className="space-y-8">
                                    <div>
                                        <label className="block text-sm font-bold mb-3 text-obabaz-earth-700">メインの主役さん</label>
                                        <div className="grid grid-cols-1 gap-3">
                                            {INGREDIENT_CATEGORIES.main.map(m => (
                                                <button
                                                    key={m}
                                                    onClick={() => setFormData(prev => ({ ...prev, main: m }))}
                                                    className={cn(
                                                        "px-5 rounded-2xl border-2 transition-all font-bold h-[48px] min-h-[48px] text-lg w-full flex items-center justify-center flex-shrink-0",
                                                        formData.main === m
                                                            ? "bg-[#AFC8E8] border-[#AFC8E8] text-white shadow-md transform scale-[1.02]"
                                                            : "bg-white border-obabaz-warm-100 text-obabaz-earth-700 hover:border-obabaz-warm-300"
                                                    )}
                                                >
                                                    {m}
                                                </button>
                                            ))}
                                        </div>
                                        {formData.main === 'その他' && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="my-10"
                                            >
                                                <label className="block text-xs font-bold mb-2 text-[#AFC8E8] uppercase tracking-wider">具体的なメイン食材を入力してください</label>
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    placeholder="例：鶏もも肉、鮭の切り身など"
                                                    className="w-full p-5 rounded-2xl border-4 border-[#AFC8E8] focus:border-obabaz-warm-400 outline-none transition-all text-lg bg-white shadow-xl"
                                                    value={formData.mainOther}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, mainOther: e.target.value }))}
                                                />
                                            </motion.div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-3 text-obabaz-earth-700">脇を固めるお野菜（3つまで）</label>
                                        <div className="grid grid-cols-1 gap-3">
                                            {INGREDIENT_CATEGORIES.vegetables.map(v => (
                                                <button
                                                    key={v}
                                                    onClick={() => toggleVegetable(v)}
                                                    className={cn(
                                                        "px-4 rounded-2xl border-2 transition-all font-bold text-lg h-[48px] min-h-[48px] w-full flex items-center justify-center flex-shrink-0",
                                                        formData.vegetables.includes(v)
                                                            ? "bg-[#AFC8E8] border-[#AFC8E8] text-white shadow-md scale-[1.02]"
                                                            : "bg-white border-obabaz-earth-100 text-obabaz-earth-700 hover:border-obabaz-warm-200"
                                                    )}
                                                >
                                                    {v}
                                                </button>
                                            ))}
                                        </div>
                                        {formData.vegetables.includes('その他') && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="my-10"
                                            >
                                                <label className="block text-xs font-bold mb-2 text-[#AFC8E8] uppercase tracking-wider">具体的なお野菜を入力してください</label>
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    placeholder="例：キャベツ、ほうれん草など"
                                                    className="w-full p-5 rounded-2xl border-4 border-[#AFC8E8] focus:border-obabaz-warm-400 outline-none transition-all text-lg bg-white shadow-xl"
                                                    value={formData.vegetablesOther}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, vegetablesOther: e.target.value }))}
                                                />
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {step === 1 && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 gap-3">
                                        {INGREDIENT_CATEGORIES.staple.map(s => (
                                            <button
                                                key={s}
                                                onClick={() => setFormData(prev => ({ ...prev, staple: s }))}
                                                className={cn(
                                                    "px-6 rounded-2xl border-2 transition-all font-bold h-[48px] min-h-[48px] text-lg w-full flex items-center justify-center flex-shrink-0",
                                                    formData.staple === s
                                                        ? "bg-[#AFC8E8] border-[#AFC8E8] text-white shadow-md scale-[1.02]"
                                                        : "bg-white border-obabaz-earth-50 text-obabaz-earth-700 hover:border-obabaz-warm-200"
                                                )}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                    {formData.staple && (
                                        <div className="pt-4 border-t border-obabaz-earth-100">
                                            <label className="block text-sm font-bold mb-3 text-obabaz-earth-700">仕立て（温度）</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {INGREDIENT_CATEGORIES.temp.map(t => (
                                                    <button
                                                        key={t}
                                                        onClick={() => setFormData(prev => ({ ...prev, stapleTemp: t }))}
                                                        className={cn(
                                                            "px-6 rounded-full border-2 transition-all font-bold h-[48px] min-h-[48px] text-lg w-full flex items-center justify-center flex-shrink-0",
                                                            formData.stapleTemp === t
                                                                ? "bg-[#AFC8E8] border-[#AFC8E8] text-white shadow-md scale-[1.02]"
                                                                : "bg-white border-obabaz-earth-50 text-obabaz-earth-700 hover:border-obabaz-warm-200"
                                                        )}
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {formData.staple === 'その他' && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="my-10"
                                        >
                                            <label className="block text-xs font-bold mb-2 text-[#AFC8E8] uppercase tracking-wider">合わせたい食材の種類を入力してください</label>
                                            <input
                                                autoFocus
                                                type="text"
                                                placeholder="例：ナン、そばなど"
                                                className="w-full p-5 rounded-2xl border-4 border-[#AFC8E8] focus:border-obabaz-warm-400 outline-none transition-all text-lg bg-white shadow-xl"
                                                value={formData.stapleOther}
                                                onChange={(e) => setFormData(prev => ({ ...prev, stapleOther: e.target.value }))}
                                            />
                                        </motion.div>
                                    )}
                                </div>
                            )}

                            {step === 2 && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {COOKING_METHODS.map(m => (
                                        <button
                                            key={m}
                                            onClick={() => setFormData(prev => ({ ...prev, method: m }))}
                                            className={cn(
                                                "rounded-3xl border-2 text-center transition-all font-bold shadow-sm h-[48px] min-h-[48px] text-lg w-full flex items-center justify-center flex-shrink-0",
                                                formData.method === m
                                                    ? "bg-[#AFC8E8] border-[#AFC8E8] text-white shadow-lg transform scale-[1.02]"
                                                    : "bg-white border-obabaz-earth-50 text-obabaz-earth-700 hover:border-obabaz-warm-200"
                                            )}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                    {formData.method === 'その他' && (
                                        <div className="col-span-2 md:col-span-3">
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="my-10"
                                            >
                                                <label className="block text-xs font-bold mb-2 text-[#AFC8E8] uppercase tracking-wider">具体的な調理方法を入力してください</label>
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    placeholder="例：低温調理、圧力鍋など"
                                                    className="w-full p-5 rounded-2xl border-4 border-[#AFC8E8] focus:border-obabaz-warm-400 outline-none transition-all text-lg bg-white shadow-xl"
                                                    value={formData.methodOther}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, methodOther: e.target.value }))}
                                                />
                                            </motion.div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-8">
                                    <div>
                                        <label className="block text-sm font-bold mb-3 text-obabaz-earth-700">深い「うまみ」のベース</label>
                                        <div className="grid grid-cols-1 gap-3">
                                            {SEASONINGS.umami.map(u => (
                                                <button
                                                    key={u}
                                                    onClick={() => setFormData(prev => ({ ...prev, umami: u }))}
                                                    className={cn(
                                                        "px-5 rounded-full border-2 transition-all font-bold h-[48px] min-h-[48px] text-lg w-full flex items-center justify-center flex-shrink-0",
                                                        formData.umami === u
                                                            ? "bg-[#AFC8E8] border-[#AFC8E8] text-white shadow-md transform scale-[1.02]"
                                                            : "bg-white border-obabaz-warm-50 text-obabaz-earth-700 hover:border-obabaz-warm-300"
                                                    )}
                                                >
                                                    {u}
                                                </button>
                                            ))}
                                        </div>
                                        {formData.umami === 'その他' && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="my-10"
                                            >
                                                <label className="block text-xs font-bold mb-2 text-[#AFC8E8] uppercase tracking-wider">具体的なうまみベースを入力してください</label>
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    placeholder="例：コンソメ、オイスターソースなど"
                                                    className="w-full p-5 rounded-2xl border-4 border-[#AFC8E8] focus:border-obabaz-warm-400 outline-none transition-all text-lg bg-white shadow-xl"
                                                    value={formData.umamiOther}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, umamiOther: e.target.value }))}
                                                />
                                            </motion.div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-3 text-obabaz-earth-700">さらに引き立つ「味付け」</label>
                                        <div className="grid grid-cols-1 gap-3">
                                            {SEASONINGS.salt.map(s => (
                                                <button
                                                    key={s}
                                                    onClick={() => setFormData(prev => ({ ...prev, salt: s }))}
                                                    className={cn(
                                                        "px-5 rounded-full border-2 transition-all font-bold h-[48px] min-h-[48px] text-lg w-full flex items-center justify-center flex-shrink-0",
                                                        formData.salt === s
                                                            ? "bg-[#AFC8E8] border-[#AFC8E8] text-white shadow-md transform scale-[1.02]"
                                                            : "bg-white border-obabaz-warm-50 text-obabaz-earth-700 hover:border-obabaz-warm-300"
                                                    )}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                        {formData.salt === 'その他' && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="my-10"
                                            >
                                                <label className="block text-xs font-bold mb-2 text-[#AFC8E8] uppercase tracking-wider">具体的な味付けを入力してください</label>
                                                <input
                                                    ref={otherInputRef}
                                                    type="text"
                                                    placeholder="例：ケチャップ、バルサミコ酢など"
                                                    className="w-full p-5 rounded-2xl border-4 border-[#AFC8E8] focus:border-obabaz-warm-400 outline-none transition-all text-lg bg-white shadow-xl relative z-30"
                                                    value={formData.saltOther}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, saltOther: e.target.value }))}
                                                />
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {step === 4 && (
                                <div className="relative">
                                    <div className="flex flex-wrap gap-4 p-4 justify-center">
                                        {ARRANGEMENTS.map(a => {
                                            const isSelected = !!formData.arrangements[a.id];
                                            const displayValue = formData.arrangements[a.id] === 'その他'
                                                ? (formData.arrangementsOther[a.id] || 'その他')
                                                : formData.arrangements[a.id];

                                            return (
                                                <div key={a.id} className={cn("transition-all duration-300", isSelected ? "w-auto min-w-[140px]" : "w-[calc(33.33%-12px)] md:w-[calc(25%-12px)]")}>
                                                    <button
                                                        onClick={() => setActiveArrangementCategory(a.id)}
                                                        className={cn(
                                                            "w-full p-4 h-24 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden",
                                                            isSelected
                                                                ? "bg-[#AFC8E8] border-[#AFC8E8] text-white shadow-lg scale-105 flex flex-row items-center justify-between gap-4 px-5"
                                                                : "bg-white border-obabaz-earth-50 hover:border-obabaz-warm-200 shadow-sm flex flex-col items-center justify-center gap-1"
                                                        )}
                                                    >
                                                        <div className={cn("flex items-center gap-3 min-w-0", isSelected ? "flex-row" : "flex-col")}>
                                                            <span className="text-xl flex-shrink-0">{a.icon}</span>
                                                            <div className={cn("flex flex-col min-w-0", isSelected ? "text-left items-start" : "text-center items-center")}>
                                                                <span className="font-bold text-[10px] md:text-sm whitespace-nowrap">{a.label}</span>
                                                                {isSelected && (
                                                                    <span className="text-[10px] opacity-90 font-medium truncate w-full">
                                                                        {displayValue}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {isSelected && (
                                                            <div
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    removeArrangement(a.id);
                                                                }}
                                                                className="flex-shrink-0 hover:bg-white/20 p-1.5 rounded-full transition-colors -mr-2"
                                                                aria-label="削除"
                                                            >
                                                                <span className="text-[10px] font-bold leading-none block">✕</span>
                                                            </div>
                                                        )}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Sub-choice Overlay */}
                                    <AnimatePresence>
                                        {activeArrangementCategory && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                className="absolute inset-0 bg-white/98 z-50 rounded-[2rem] p-6 pb-24 flex flex-col shadow-xl border border-obabaz-warm-100"
                                            >
                                                <div className="flex justify-between items-center mb-6 bg-obabaz-earth-50/50 p-2 pl-4 rounded-full border border-obabaz-warm-100">
                                                    <h3 className="font-bold text-lg text-obabaz-earth-800 flex items-center gap-2">
                                                        <span className="text-xl">{ARRANGEMENTS.find(a => a.id === activeArrangementCategory)?.icon}</span>
                                                        {ARRANGEMENTS.find(a => a.id === activeArrangementCategory)?.label}を選ぶ
                                                    </h3>
                                                    <button
                                                        onClick={() => setActiveArrangementCategory(null)}
                                                        className="text-obabaz-earth-400 hover:text-obabaz-earth-600 bg-white w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm hover:shadow-md active:scale-90"
                                                        aria-label="閉じる"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                                <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar min-h-0" style={{ maxHeight: '70vh' }}>
                                                    <div className="flex flex-col gap-2 mb-4">
                                                        {ARRANGEMENTS.find(a => a.id === activeArrangementCategory)?.options.map(opt => (
                                                            <button
                                                                key={opt}
                                                                onClick={() => selectArrangementOption(activeArrangementCategory, opt)}
                                                                style={{ minHeight: '48px', height: '48px', flexShrink: 0 }}
                                                                className={cn(
                                                                    "px-5 rounded-full border-2 text-lg font-bold transition-all w-full flex items-center justify-center",
                                                                    formData.arrangements[activeArrangementCategory] === opt
                                                                        ? "bg-[#AFC8E8] border-[#AFC8E8] text-white shadow-md"
                                                                        : "bg-white border-obabaz-warm-100 text-obabaz-earth-700 hover:border-obabaz-warm-300"
                                                                )}
                                                            >
                                                                {opt}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    {formData.arrangements[activeArrangementCategory] === 'その他' && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            className="mb-4 px-2"
                                                        >
                                                            <label className="block text-xs font-bold mb-2 text-[#AFC8E8] uppercase tracking-wider">具体的なアレンジを入力してください</label>
                                                            <input
                                                                ref={otherInputRef}
                                                                type="text"
                                                                placeholder="例：フライドオニオン、柚子胡椒など"
                                                                className="w-full p-5 rounded-2xl border-4 border-[#AFC8E8] focus:border-obabaz-warm-400 outline-none transition-all text-lg bg-white shadow-xl relative z-30"
                                                                value={formData.arrangementsOther[activeArrangementCategory] || ''}
                                                                onChange={(e) => setFormData(prev => ({
                                                                    ...prev,
                                                                    arrangementsOther: {
                                                                        ...prev.arrangementsOther,
                                                                        [activeArrangementCategory]: e.target.value
                                                                    }
                                                                }))}
                                                            />
                                                        </motion.div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            {step === 5 && recipe && (
                                <div className="space-y-6">
                                    <div className="bg-white/95 border-[6px] border-[#A8C3A1] shadow-2xl relative overflow-hidden flex flex-col h-auto">
                                        <div style={{ padding: '24px', paddingBottom: '120px' }}>
                                            <h3 className="text-2xl md:text-3xl font-black text-obabaz-warm-800 mb-6 flex items-center gap-3">
                                                {recipe.title}
                                            </h3>
                                            <p style={{ color: '#4A3B31', fontStyle: 'italic', marginBottom: '32px', paddingLeft: '12px', lineHeight: '1.6', fontSize: '1rem' }}>
                                                {recipe.description}
                                            </p>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                                {recipe.steps.map((s, i) => (
                                                    <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                                        <div style={{ backgroundColor: '#AFC8E8', color: 'white', width: '28px', height: '28px', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '900', flexShrink: 0, marginTop: '4px' }}>
                                                            {i + 1}
                                                        </div>
                                                        <div style={{ color: '#2D241E', lineHeight: '1.6', fontWeight: '700', fontSize: '1.125rem', flexGrow: 1, paddingTop: '2px' }}>
                                                            {s}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div style={{ position: 'absolute', bottom: '24px', left: '0', right: '0', display: 'flex', justifyContent: 'center', zIndex: 100 }}>
                                            <button
                                                onClick={reset}
                                                className="bg-obabaz-earth-800 hover:bg-obabaz-earth-900 text-white px-8 py-4 rounded-full font-black shadow-2xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95 whitespace-nowrap text-base"
                                            >
                                                <RotateCcw className="w-5 h-5" /> もう一度考える
                                            </button>
                                        </div>

                                    </div>

                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="bg-obabaz-warm-100 p-6 rounded-2xl flex items-start gap-4 border border-obabaz-warm-200"
                                    >
                                        <div className="bg-white p-2 rounded-full shadow-sm">
                                            <Heart className="w-6 h-6 text-obabaz-warm-500" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-obabaz-warm-800 text-base mb-1">obabazからの台所の知恵</p>
                                            <p className="text-obabaz-earth-700 leading-relaxed text-sm">{recipe.tip}</p>
                                        </div>
                                    </motion.div>

                                    {/* AI Prompt Section */}
                                    <div className="pt-12 border-t-2 border-dashed border-obabaz-warm-300 pb-16">
                                        <div className="flex items-center gap-2 mb-6">
                                            <Sparkles className="w-6 h-6 text-obabaz-warm-500" />
                                            <h4 className="font-black text-xl text-obabaz-earth-800">生成AI（ChatGPT/Gemini等）で詳細レシピを作る</h4>
                                        </div>
                                        <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl mb-6 border border-obabaz-warm-100 shadow-sm">
                                            <p className="text-obabaz-earth-700 leading-relaxed font-bold">
                                                このプロンプトをコピーして生成AIに貼り付けると、より詳細なレシピが作成できます。
                                            </p>
                                        </div>
                                        <div className="relative group rounded-2xl overflow-hidden shadow-2xl border-[4px] border-obabaz-earth-900 bg-obabaz-earth-900">
                                            <div className="flex items-center justify-between px-6 py-3 bg-obabaz-earth-800 border-b border-obabaz-earth-700">
                                                <span className="text-obabaz-earth-300 text-xs font-mono font-bold uppercase tracking-widest">Markdown Prompt</span>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(recipe.prompt);
                                                        const btn = document.getElementById('copy-indicator');
                                                        if (btn) {
                                                            btn.textContent = 'コピー完了！';
                                                            setTimeout(() => btn.textContent = 'コピーする', 2000);
                                                        }
                                                    }}
                                                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded-full text-xs font-black transition-all border border-white/20 active:scale-95"
                                                >
                                                    <span id="copy-indicator">コピーする</span>
                                                </button>
                                            </div>
                                            <pre className="p-8 text-obabaz-earth-50 text-sm overflow-x-auto font-mono leading-loose max-h-[500px] overflow-y-auto custom-scrollbar-dark text-left whitespace-pre-wrap">
                                                {recipe.prompt}
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {step < 5 && (
                        <div className="mt-12 flex justify-between items-center z-10">
                            {step > 0 && (
                                <button
                                    onClick={prevStep}
                                    className="flex items-center gap-2 text-obabaz-earth-400 hover:text-obabaz-earth-700 font-bold transition-all px-4 py-2 rounded-full hover:bg-white/50"
                                >
                                    <ChevronLeft className="w-5 h-5" /> 前に戻る
                                </button>
                            )}
                            <div className="flex-grow"></div>
                            <button
                                onClick={nextStep}
                                disabled={
                                    (step === 0 && (!formData.main || formData.vegetables.length === 0)) ||
                                    (step === 1 && !formData.staple) ||
                                    (step === 2 && !formData.method) ||
                                    (step === 3 && (!formData.umami || !formData.salt))
                                }
                                className="bg-obabaz-warm-600 hover:bg-obabaz-warm-700 disabled:bg-obabaz-earth-100 disabled:text-obabaz-earth-300 disabled:cursor-not-allowed text-white px-10 py-4 rounded-full font-bold shadow-xl shadow-obabaz-warm-200/50 flex items-center gap-3 transition-all hover:scale-105 active:scale-95"
                            >
                                {step === 4 ? '献立を整える' : '次のステップへ'} <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>

                <footer className="mt-12 text-center text-[#C8B7FF] text-xs pb-10 font-bold">
                    <p className="mb-2">美味しくなーれ、の気持ちを込めて。</p>
                    &copy; 2026 obabaz Meal Design.
                    <button
                        onClick={() => setShowModal('terms')}
                        className="ml-3 text-[#A8C3A1] hover:underline"
                    >
                        利用規約
                    </button>
                </footer>
            </main >

            {/* Sidebar Menu - Re-positioned at the bottom of the tree for best stacking context */}
            <AnimatePresence>
                {isMenuOpen && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 99999 }}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute top-0 right-0 h-full w-80 shadow-2xl p-8 flex flex-col border-l border-obabaz-warm-300 solid-bg"
                        >
                            <div className="flex justify-end mb-8">
                                <button
                                    onClick={() => setIsMenuOpen(false)}
                                    className="p-2 rounded-full hover:bg-white/50 transition-all"
                                >
                                    <X className="w-6 h-6 text-obabaz-earth-600" />
                                </button>
                            </div>
                            <nav className="space-y-6">
                                <button
                                    onClick={() => { setShowModal('about'); setIsMenuOpen(false); }}
                                    className="w-full text-left font-bold text-obabaz-earth-700 hover:text-obabaz-warm-600 transition-colors flex items-center gap-3 text-lg"
                                >
                                    <Heart className="w-5 h-5" /> このアプリについて
                                </button>
                                <button
                                    onClick={() => { setShowModal('terms'); setIsMenuOpen(false); }}
                                    className="w-full text-left font-bold text-obabaz-earth-700 hover:text-obabaz-warm-600 transition-colors flex items-center gap-3 text-lg"
                                >
                                    <Utensils className="w-5 h-5" /> 利用規約
                                </button>
                                <button
                                    onClick={() => { setShowModal('privacy'); setIsMenuOpen(false); }}
                                    className="w-full text-left font-bold text-obabaz-earth-700 hover:text-obabaz-warm-600 transition-colors flex items-center gap-3 text-lg"
                                >
                                    <Sparkles className="w-5 h-5" /> プライバシーポリシー
                                </button>
                            </nav>
                            <div className="mt-auto pt-8 border-t border-obabaz-earth-200 text-xs text-obabaz-earth-400 font-medium">
                                obabaz 献立帖 v1.0
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal - Re-positioned at the bottom of the tree for best stacking context */}
            <AnimatePresence>
                {showModal && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                            onClick={() => setShowModal(null)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="w-full max-w-2xl max-h-[90vh] rounded-[3rem] shadow-[0_40px_80px_rgba(0,0,0,0.6)] relative z-[100001] overflow-hidden border-[10px] border-[#A8C3A1] solid-bg"
                        >
                            <div className="p-12 md:p-24 overflow-y-auto max-h-[90vh] custom-scrollbar scroll-smooth">
                                {showModal === 'about' && (
                                    <div className="space-y-12 pt-12">
                                        <h2 className="text-4xl md:text-5xl font-black text-[#A8C3A1] mb-12 border-b-8 border-[#A8C3A1]/20 pb-8 tracking-tighter">このアプリについて</h2>
                                        <p className="font-bold text-obabaz-earth-800 text-2xl text-center italic mb-12 bg-obabaz-warm-50 py-4 rounded-2xl">〜 旬を愛で、手間を慈しむ台所から 〜</p>
                                        <div className="space-y-8 text-obabaz-earth-800 leading-relaxed text-xl font-medium">
                                            <p>「今日の夕飯、どうしよう」 そんな何気ない、けれど毎日続く大切な悩みに、寄り添える道具を作りたい。そんな想いから「obabaz 献立帖」は生まれました。</p>
                                            <p>効率だけを追い求めるのではなく、その時の気分や、季節の移ろい、そして「美味しくなーれ」という少しの魔法を大切に。 経験豊富な料理人が隣でアドバイスをくれるような、温かい時間をあなたの台所にお届けします。</p>
                                        </div>
                                    </div>
                                )}
                                {showModal === 'terms' && (
                                    <div className="space-y-12 pt-12">
                                        <h2 className="text-4xl md:text-5xl font-black text-[#A8C3A1] mb-12 border-b-8 border-[#A8C3A1]/20 pb-8 tracking-tighter">利用規約</h2>
                                        <p className="text-obabaz-earth-800 leading-relaxed font-bold text-lg mb-8">本アプリは、日々の献立作りをサポートするための道具です。ご利用の際は、以下の点をご確認ください。</p>
                                        <div className="space-y-10 text-obabaz-earth-900">
                                            <div className="bg-white/50 p-6 rounded-3xl border border-obabaz-warm-100 shadow-sm">
                                                <h3 className="font-black text-2xl mb-4 text-obabaz-earth-900 flex items-center gap-3"><span className="bg-[#A8C3A1] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span> サービスの目的</h3>
                                                <p className="text-lg leading-relaxed">本アプリは、ユーザーが入力した条件に基づき、AIを通じて献立のヒントやレシピ案を提案するものです。</p>
                                            </div>
                                            <div className="bg-white/50 p-6 rounded-3xl border border-obabaz-warm-100 shadow-sm">
                                                <h3 className="font-black text-2xl mb-4 text-obabaz-earth-900 flex items-center gap-3"><span className="bg-[#A8C3A1] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span> 自己責任の原則</h3>
                                                <p className="text-lg leading-relaxed">AIが生成する情報は、必ずしも正確性や安全性を保証するものではありません。調理の際は、食材の状態や加熱の加減、アレルギー情報などを、ご自身の経験と判断で必ず確認してください。</p>
                                            </div>
                                            <div className="bg-white/50 p-6 rounded-3xl border border-obabaz-warm-100 shadow-sm">
                                                <h3 className="font-black text-2xl mb-4 text-obabaz-earth-900 flex items-center gap-3"><span className="bg-[#A8C3A1] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span> 免責事項</h3>
                                                <p className="text-lg leading-relaxed">本アプリの利用により生じた損害（体調不良、事故、損害等）について、開発者は一切の責任を負いかねます。</p>
                                            </div>
                                            <div className="bg-white/50 p-6 rounded-3xl border border-obabaz-warm-100 shadow-sm">
                                                <h3 className="font-black text-2xl mb-4 text-obabaz-earth-900 flex items-center gap-3"><span className="bg-[#A8C3A1] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span> 禁止事項</h3>
                                                <p className="text-lg leading-relaxed">公序良俗に反する利用や、システムの解析・改ざん、商用目的での無断転載はお控えください。</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {showModal === 'privacy' && (
                                    <div className="space-y-12 pt-12">
                                        <h2 className="text-4xl md:text-5xl font-black text-[#A8C3A1] mb-12 border-b-8 border-[#A8C3A1]/20 pb-8 tracking-tighter">プライバシーポリシー</h2>
                                        <div className="space-y-10 text-obabaz-earth-900">
                                            <div className="bg-white/50 p-6 rounded-3xl border border-obabaz-warm-100 shadow-sm">
                                                <h3 className="font-black text-2xl mb-4 text-obabaz-earth-900 flex items-center gap-3"><span className="bg-[#A8C3A1] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span> 情報の収集</h3>
                                                <p className="text-lg leading-relaxed">本アプリでは、サービスの改善や動作確認のために、匿名の利用状況データを収集することがありますが、個人を特定する情報は取得いたしません。</p>
                                            </div>
                                            <div className="bg-white/50 p-6 rounded-3xl border border-obabaz-warm-100 shadow-sm">
                                                <h3 className="font-black text-2xl mb-4 text-obabaz-earth-900 flex items-center gap-3"><span className="bg-[#A8C3A1] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span> 入力内容の扱い</h3>
                                                <p className="text-lg leading-relaxed">ユーザーが入力した食材やアレンジの情報は、レシピ生成のためにAI（Gemini API等）へ送信されますが、本アプリ側で特定の個人に関連付けて保存することはありません。</p>
                                            </div>
                                            <div className="bg-white/50 p-6 rounded-3xl border border-obabaz-warm-100 shadow-sm">
                                                <h3 className="font-black text-2xl mb-4 text-obabaz-earth-900 flex items-center gap-3"><span className="bg-[#A8C3A1] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span> 第三者提供</h3>
                                                <p className="text-lg leading-relaxed">法令に基づく場合を除き、取得した情報を第三者に提供することはありません。</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="mt-20 mb-10 flex justify-center">
                                    <button
                                        onClick={() => setShowModal(null)}
                                        className="bg-[#A8C3A1] hover:bg-[#8da387] text-white px-16 py-5 rounded-full font-black text-xl shadow-2xl transition-all hover:scale-105 active:scale-95"
                                    >
                                        閉じる
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
}
