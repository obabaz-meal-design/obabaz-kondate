import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, RotateCcw, Utensils, Heart, Sparkles, Menu, X, Scale, Coins } from 'lucide-react';
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
                        className="w-12 h-12 flex items-center justify-center transition-all active:scale-90 active:brightness-90 flex-shrink-0 bg-transparent border-0 shadow-none outline-none appearance-none p-0"
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
                                <div className="space-y-4 px-2">
                                    {ARRANGEMENTS.map(a => {
                                        const isSelected = !!formData.arrangements[a.id];
                                        const isActive = activeArrangementCategory === a.id;
                                        const displayValue = formData.arrangements[a.id] === 'その他'
                                            ? (formData.arrangementsOther[a.id] || 'その他')
                                            : formData.arrangements[a.id];

                                        return (
                                            <div key={a.id} className="overflow-hidden border-2 border-obabaz-warm-100 rounded-3xl bg-white shadow-sm transition-all duration-300">
                                                <button
                                                    onClick={() => setActiveArrangementCategory(isActive ? null : a.id)}
                                                    className={cn(
                                                        "w-full p-5 flex items-center justify-between transition-all",
                                                        isActive ? "bg-obabaz-warm-50" : "bg-white"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-4 min-w-0">
                                                        <span className="text-2xl flex-shrink-0">{a.icon}</span>
                                                        <div className="text-left min-w-0">
                                                            <h4 className="font-bold text-obabaz-earth-800 text-base">{a.label}</h4>
                                                            {isSelected && !isActive && (
                                                                <p className="text-xs text-obabaz-warm-600 font-bold truncate">
                                                                    選択中: {displayValue}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {isSelected && (
                                                            <div
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    removeArrangement(a.id);
                                                                }}
                                                                className="bg-obabaz-earth-100 text-obabaz-earth-600 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black hover:bg-obabaz-warm-200 transition-colors"
                                                            >
                                                                ✕
                                                            </div>
                                                        )}
                                                        <div className={cn("transition-transform duration-300", isActive ? "rotate-180" : "")}>
                                                            <ChevronLeft className="w-5 h-5 -rotate-90 text-obabaz-earth-300" />
                                                        </div>
                                                    </div>
                                                </button>

                                                <AnimatePresence>
                                                    {isActive && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                                                        >
                                                            <div className="p-4 pt-0 bg-obabaz-warm-50/30 border-t border-obabaz-warm-50">
                                                                <div className="grid grid-cols-1 gap-2 py-4">
                                                                    {a.options.map(opt => (
                                                                        <button
                                                                            key={opt}
                                                                            onClick={() => selectArrangementOption(a.id, opt)}
                                                                            style={{ minHeight: '48px', height: '48px' }}
                                                                            className={cn(
                                                                                "px-6 rounded-2xl border-2 text-base font-bold transition-all w-full flex items-center justify-center",
                                                                                formData.arrangements[a.id] === opt
                                                                                    ? "bg-[#AFC8E8] border-[#AFC8E8] text-white shadow-md"
                                                                                    : "bg-white border-obabaz-warm-100 text-obabaz-earth-700 hover:border-obabaz-warm-200"
                                                                            )}
                                                                        >
                                                                            {opt}
                                                                        </button>
                                                                    ))}
                                                                </div>

                                                                {formData.arrangements[a.id] === 'その他' && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, y: -10 }}
                                                                        animate={{ opacity: 1, y: 0 }}
                                                                        className="pb-4"
                                                                    >
                                                                        <label className="block text-[10px] font-black mb-2 text-obabaz-warm-400 uppercase tracking-widest pl-2">具体的な内容を教えてください</label>
                                                                        <input
                                                                            ref={otherInputRef}
                                                                            type="text"
                                                                            placeholder="例：フライドオニオン、柚子胡椒など"
                                                                            className="w-full p-4 rounded-xl border-2 border-[#AFC8E8] focus:border-obabaz-warm-400 outline-none transition-all text-base bg-white shadow-sm relative z-10"
                                                                            value={formData.arrangementsOther[a.id] || ''}
                                                                            onChange={(e) => setFormData(prev => ({
                                                                                ...prev,
                                                                                arrangementsOther: {
                                                                                    ...prev.arrangementsOther,
                                                                                    [a.id]: e.target.value
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
                                        );
                                    })}

                                    {/* 150px footer spacer to ensure bottom items are not hidden by fixed action buttons */}
                                    <div className="h-[150px] w-full" />
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
                            className="absolute top-0 right-0 h-full w-80 shadow-2xl p-10 flex flex-col border-l border-obabaz-warm-300 bg-[#AFC8E8]/90 backdrop-blur-xl"
                        >
                            <div className="flex justify-end mb-8">
                                <button
                                    onClick={() => setIsMenuOpen(false)}
                                    className="w-16 h-16 flex items-center justify-center transition-all active:brightness-90 active:scale-90 flex-shrink-0 bg-transparent border-0 shadow-none outline-none appearance-none p-0"
                                    aria-label="メニューを閉じる"
                                >
                                    <X className="w-10 h-10 text-obabaz-warm-600" />
                                </button>
                            </div>
                            <nav className="space-y-8">
                                <button
                                    onClick={() => { setShowModal('about'); setIsMenuOpen(false); }}
                                    className="w-full text-left font-bold text-[#333333] hover:text-obabaz-warm-600 transition-all active:brightness-90 active:scale-[0.98] flex items-center gap-4 text-lg py-4 px-4 min-h-[56px]"
                                >
                                    <Heart className="w-6 h-6" /> このアプリについて
                                </button>
                                <button
                                    onClick={() => { setShowModal('terms'); setIsMenuOpen(false); }}
                                    className="w-full text-left font-bold text-[#333333] hover:text-obabaz-warm-600 transition-all active:brightness-90 active:scale-[0.98] flex items-center gap-4 text-lg py-4 px-4 min-h-[56px]"
                                >
                                    <Utensils className="w-6 h-6" /> 利用規約
                                </button>
                                <button
                                    onClick={() => { setShowModal('privacy'); setIsMenuOpen(false); }}
                                    className="w-full text-left font-bold text-[#333333] hover:text-obabaz-warm-600 transition-all active:brightness-90 active:scale-[0.98] flex items-center gap-4 text-lg py-4 px-4 min-h-[56px]"
                                >
                                    <Sparkles className="w-6 h-6" /> プライバシーポリシー
                                </button>
                                <button
                                    onClick={() => { setShowModal('legal'); setIsMenuOpen(false); }}
                                    className="w-full text-left font-bold text-[#333333] hover:text-obabaz-warm-600 transition-all active:brightness-90 active:scale-[0.98] flex items-center gap-4 text-lg py-4 px-4 min-h-[56px]"
                                >
                                    <Scale className="w-6 h-6" /> 特定商取引法に基づく表記
                                </button>
                                <button
                                    onClick={() => { setShowModal('gratitude'); setIsMenuOpen(false); }}
                                    className="w-full text-left font-bold text-[#333333] hover:text-obabaz-warm-600 transition-all active:brightness-90 active:scale-[0.98] flex items-center gap-4 text-lg py-4 px-4 min-h-[56px]"
                                >
                                    <Coins className="w-6 h-6" /> 感謝の循環について
                                </button>
                            </nav>
                            <div className="mt-auto pt-8 pb-12 border-t border-obabaz-earth-200 text-xs text-obabaz-earth-400 font-medium">
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
                                    <div className="space-y-8 pt-12 text-[#333333]">
                                        <h2 className="text-4xl md:text-5xl font-black text-[#A8C3A1] mb-12 border-b-8 border-[#A8C3A1]/20 pb-8 tracking-tighter">このアプリについて</h2>
                                        <div className="bg-obabaz-warm-50 py-6 px-8 rounded-3xl mb-12 shadow-inner">
                                            <p className="font-bold text-[#333333] text-xl md:text-2xl text-center italic leading-relaxed">〜 季節と今日の気分に寄り添う台所から 〜</p>
                                        </div>
                                        <div className="leading-relaxed text-lg md:text-xl font-medium space-y-6">
                                            <p>「今日の夕飯、どうしよう。」<br />
                                                そんな何気ない、けれど毎日続く大切な悩みに寄り添える道具を作りたい。</p>

                                            <p>そんな想いから、obabaz Meal Design 体験アプリは生まれました。<br />
                                                旬の食材を楽しみたい気持ちも、冷蔵庫にあるもので済ませたい日も、どちらも、あなたの大切な台所の現実です。</p>

                                            <p>効率だけを追い求めるのではなく、その日の気分や体調、買い物のあとに残った野菜や、少ししなびた葉物まで含めて。「美味しくなーれ」という小さな気持ちを、置き去りにしないために。</p>

                                            <p>けれど実際は、献立を決めるだけで、思った以上に心は疲れています。<br />
                                                何を使うか。どう調理するか。どんな味にするか。毎日の献立は、小さな判断の連続です。</p>

                                            <p>レシピを検索すれば答えは出てきます。けれど、それが今の自分に合っているかを決めるのは、また別の思考です。</p>

                                            <p className="font-black text-obabaz-warm-600 pt-4 border-t border-obabaz-warm-100">このアプリは、答えを提示するためのものではありません。</p>

                                            <p>食材 → 調理法 → 味付け と、考える順番を整えることで、一度に抱えていた判断を、ひとつずつに分けていく。<br />
                                                そうして、思考の負担をそっと軽くする。</p>

                                            <p>考えなくていいのに、ちゃんと自分で決めたと思える。その体験をつくるための設計を、大切にしています。</p>

                                            <p>隣で答えを出すのではなく、そっと順番を整える存在でありたい。</p>

                                            <p>このアプリは「正解」を提示するものではありません。選ぶのは、いつもあなたです。</p>

                                            <p>そして、その選択が、少しだけ穏やかな時間につながればと願っています。</p>
                                        </div>
                                    </div>
                                )}
                                {showModal === 'terms' && (
                                    <div className="space-y-12 pt-12 text-[#333333]">
                                        <h2 className="text-4xl md:text-5xl font-black text-[#A8C3A1] mb-12 border-b-8 border-[#A8C3A1]/20 pb-8 tracking-tighter">利用規約</h2>
                                        <div className="space-y-8">
                                            <div className="bg-white/50 p-6 md:p-8 rounded-3xl border border-obabaz-warm-100 shadow-sm">
                                                <h3 className="font-black text-2xl mb-6 border-l-8 border-[#A8C3A1] pl-4">obabaz Meal Design 利用規約</h3>
                                                <p className="text-lg leading-relaxed mb-6 font-bold">本アプリは、日々の献立作りをサポートするための道具です。ご利用にあたり、以下の内容をご確認ください。</p>

                                                <div className="space-y-8">
                                                    <div>
                                                        <h4 className="font-black text-xl mb-3 flex items-center gap-2">
                                                            <span className="bg-[#A8C3A1] text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-black">1</span>
                                                            <strong>サービスの目的</strong>
                                                        </h4>
                                                        <p className="text-lg leading-relaxed pl-9">
                                                            本アプリは、ユーザーが入力した条件に基づき、AIを通じて献立のヒントやレシピ案を提案するものです。
                                                            料理の決定や最終判断は、ユーザーご自身の判断に委ねられます。
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <h4 className="font-black text-xl mb-3 flex items-center gap-2">
                                                            <span className="bg-[#A8C3A1] text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-black">2</span>
                                                            <strong>自己判断の原則</strong>
                                                        </h4>
                                                        <p className="text-lg leading-relaxed pl-9">
                                                            AIが生成するレシピはあくまで「提案」です。調理の際は、<strong>食材の鮮度や保存状態、十分な加熱、アレルギーの有無、調理器具の安全な使用</strong>などを、<strong>必ずご自身の判断と責任において確認してください。</strong>
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <h4 className="font-black text-xl mb-3 flex items-center gap-2">
                                                            <span className="bg-[#A8C3A1] text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-black">3</span>
                                                            <strong>免責事項</strong>
                                                        </h4>
                                                        <p className="text-lg leading-relaxed pl-9">
                                                            本アプリの利用に関連して生じた損害（体調不良、事故、その他の損害等）については、
                                                            法令により認められる範囲内で、運営者は責任を負わないものとします。
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <h4 className="font-black text-xl mb-3 flex items-center gap-2">
                                                            <span className="bg-[#A8C3A1] text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-black">4</span>
                                                            <strong>禁止事項</strong>
                                                        </h4>
                                                        <p className="text-lg leading-relaxed pl-9 mb-4">以下の行為を禁止します。</p>
                                                        <ul className="list-disc list-inside space-y-2 pl-12 text-lg">
                                                            <li>公序良俗に反する利用</li>
                                                            <li>システムの解析・改ざん</li>
                                                            <li>商用目的での無断転載</li>
                                                            <li>その他、運営に支障を与える行為</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                                <p className="mt-12 text-sm text-obabaz-earth-400 font-medium pt-6 border-t border-obabaz-warm-100">
                                                    本規約は、必要に応じて予告なく変更される場合があります。
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {showModal === 'privacy' && (
                                    <div className="space-y-12 pt-12 text-[#333333]">
                                        <h2 className="text-4xl md:text-5xl font-black text-[#A8C3A1] mb-12 border-b-8 border-[#A8C3A1]/20 pb-8 tracking-tighter">プライバシーポリシー</h2>
                                        <div className="space-y-8">
                                            <div className="bg-white/50 p-6 md:p-8 rounded-3xl border border-obabaz-warm-100 shadow-sm">
                                                <p className="font-bold text-lg mb-8 leading-relaxed">本アプリでは、安心してご利用いただくために、以下の方針で情報を取り扱います。</p>

                                                <div className="space-y-8">
                                                    <div>
                                                        <h3 className="font-black text-xl mb-3 flex items-center gap-2">
                                                            <span className="bg-[#A8C3A1] text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-black">1</span>
                                                            <strong>情報の収集</strong>
                                                        </h3>
                                                        <div className="text-lg leading-relaxed pl-9 space-y-2">
                                                            <p>本アプリでは、サービス改善および動作確認のために、匿名の利用状況データを取得する場合があります。</p>
                                                            <p>通常の利用において、個人を特定する情報を取得することはありません。</p>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <h3 className="font-black text-xl mb-3 flex items-center gap-2">
                                                            <span className="bg-[#A8C3A1] text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-black">2</span>
                                                            <strong>入力内容の取り扱い</strong>
                                                        </h3>
                                                        <div className="text-lg leading-relaxed pl-9 space-y-2">
                                                            <p>ユーザーが入力した食材・調理法・アレンジ情報は、レシピ生成のために外部AIサービス（例：Google Gemini API 等）へ送信される場合があります。</p>
                                                            <p>送信されたデータは、各提供元のプライバシーポリシーに基づいて処理されます。</p>
                                                            <p className="font-bold text-obabaz-warm-600">本アプリ側で、入力内容を特定の個人に関連付けて保存することはありません。</p>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <h3 className="font-black text-xl mb-3 flex items-center gap-2">
                                                            <span className="bg-[#A8C3A1] text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-black">3</span>
                                                            <strong>第三者提供</strong>
                                                        </h3>
                                                        <p className="text-lg leading-relaxed pl-9">
                                                            法令に基づく場合を除き、取得した情報を第三者へ提供することはありません。
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <h3 className="font-black text-xl mb-3 flex items-center gap-2">
                                                            <span className="bg-[#A8C3A1] text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-black">4</span>
                                                            <strong>安全管理</strong>
                                                        </h3>
                                                        <p className="text-lg leading-relaxed pl-9">
                                                            取得した情報は、不正アクセス・漏えい・改ざんなどを防止するため、適切な管理を行います。
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="mt-12 text-sm text-obabaz-earth-400 font-medium pt-6 border-t border-obabaz-warm-100 italic text-center">
                                                    必要に応じて、本ポリシーは改定されることがあります。
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {showModal === 'legal' && (
                                    <div className="space-y-12 pt-12 text-[#333333]">
                                        <h2 className="text-4xl md:text-5xl font-black text-[#A8C3A1] mb-12 border-b-8 border-[#A8C3A1]/20 pb-8 tracking-tighter">特定商取引法に基づく表記</h2>
                                        <div className="space-y-8">
                                            <div className="bg-white/50 p-6 md:p-8 rounded-3xl border border-obabaz-warm-100 shadow-sm">
                                                <div className="space-y-8">
                                                    <div className="border-b border-obabaz-warm-100 pb-4">
                                                        <h3 className="font-black text-lg mb-2 text-obabaz-warm-600"><strong>事業者名</strong></h3>
                                                        <p className="text-xl font-bold">obabaz（オババゼット）</p>
                                                    </div>
                                                    <div className="border-b border-obabaz-warm-100 pb-4">
                                                        <h3 className="font-black text-lg mb-2 text-obabaz-warm-600"><strong>代表者名</strong></h3>
                                                        <p className="text-xl font-bold">五十嵐 昭子</p>
                                                    </div>
                                                    <div className="border-b border-obabaz-warm-100 pb-4">
                                                        <h3 className="font-black text-lg mb-2 text-obabaz-warm-600"><strong>所在地・電話番号</strong></h3>
                                                        <p className="text-lg">ご請求があった場合、遅滞なく開示いたします。<br /><span className="text-sm text-obabaz-earth-400">（お問い合わせは下記のメールアドレスへお願いいたします）</span></p>
                                                    </div>
                                                    <div className="border-b border-obabaz-warm-100 pb-4">
                                                        <h3 className="font-black text-lg mb-2 text-obabaz-warm-600"><strong>連絡先</strong></h3>
                                                        <p className="text-lg">メールアドレス：black.kiji611@gmail.com</p>
                                                    </div>
                                                    <div className="border-b border-obabaz-warm-100 pb-4">
                                                        <h3 className="font-black text-lg mb-2 text-obabaz-warm-600"><strong>提供内容および対価</strong></h3>
                                                        <ul className="list-disc list-inside space-y-2 text-lg">
                                                            <li>obabaz Meal Design 体験アプリの提供</li>
                                                            <li>上記活動の維持・運営のための応援入金の受付<br />
                                                                <span className="text-sm pl-6 block">（応援入金は任意であり、金額は50円〜100,000円の範囲で自由に設定いただけます）</span>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                    <div className="border-b border-obabaz-warm-100 pb-4">
                                                        <h3 className="font-black text-lg mb-2 text-obabaz-warm-600"><strong>支払方法・時期</strong></h3>
                                                        <p className="text-lg">クレジットカード決済等。支払時期は各カード会社の規定に基づきます。</p>
                                                    </div>
                                                    <div className="border-b border-obabaz-warm-100 pb-4">
                                                        <h3 className="font-black text-lg mb-2 text-obabaz-warm-600"><strong>商品の引渡時期</strong></h3>
                                                        <p className="text-lg">決済完了後、即時に提供いたします。</p>
                                                    </div>
                                                    <div className="border-b border-obabaz-warm-100 pb-4">
                                                        <h3 className="font-black text-lg mb-2 text-obabaz-warm-600"><strong>返品・キャンセルについて</strong></h3>
                                                        <p className="text-lg">デジタルコンテンツおよび応援入金の性質上、決済完了後の返金・キャンセルには対応しておりません。</p>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-black text-lg mb-2 text-obabaz-warm-600"><strong>免責事項</strong></h3>
                                                        <p className="text-lg">本アプリはAIを活用した献立提案サービスです。情報の正確性や効果を保証するものではありません。提供内容をご理解の上、ご自身の判断でご活用ください。</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {showModal === 'gratitude' && (
                                    <div className="space-y-12 pt-12 text-[#333333]">
                                        <h2 className="text-4xl md:text-5xl font-black text-[#A8C3A1] mb-12 border-b-8 border-[#A8C3A1]/20 pb-8 tracking-tighter">感謝の循環について</h2>
                                        <div className="space-y-8">
                                            <div className="bg-white/50 p-6 md:p-10 rounded-[3rem] leading-relaxed">
                                                <div className="space-y-6 text-lg md:text-xl">
                                                    <p>ここは、obabaz Meal Design の体験に感謝の気持ちが生まれたときのための場所です。</p>
                                                    <p>体験は、これからも無料でご利用いただけます。</p>

                                                    <div className="bg-[#F6E7A6]/30 p-4 rounded-2xl border border-[#F6E7A6]/50">
                                                        <p className="text-center font-bold">使い続けるために、何かを支払う必要はありません。<br />
                                                            支払いは、あくまで任意です。</p>
                                                    </div>

                                                    <div className="space-y-6 pt-6">
                                                        <div>
                                                            <h3 className="font-black text-xl mb-3 flex items-center gap-2 text-obabaz-warm-600"><strong>金額について</strong></h3>
                                                            <p className="pl-4">金額は、ご自身のタイミングと気持ちに合わせて自由に決めていただけます。</p>
                                                        </div>

                                                        <div>
                                                            <h3 className="font-black text-xl mb-3 flex items-center gap-2 text-obabaz-warm-600"><strong>お金の流れ</strong></h3>
                                                            <p className="pl-4 mb-4">いただいた金額は、決済に必要な手数料を除いたうえで、次のように分けられます。</p>
                                                            <div className="grid grid-cols-2 gap-4 text-center">
                                                                <div className="bg-white p-4 rounded-2xl border-2 border-[#A8C3A1]/20">
                                                                    <p className="text-sm font-bold text-obabaz-earth-400">運営へ</p>
                                                                    <p className="text-3xl font-black text-[#A8C3A1]">50%</p>
                                                                </div>
                                                                <div className="bg-white p-4 rounded-2xl border-2 border-[#C8B7FF]/20">
                                                                    <p className="text-sm font-bold text-obabaz-earth-400">寄付へ</p>
                                                                    <p className="text-3xl font-black text-[#C8B7FF]">50%</p>
                                                                </div>
                                                            </div>
                                                            <p className="text-center text-sm mt-4 font-bold text-obabaz-earth-400 italic">この仕組みは固定です。</p>
                                                        </div>
                                                    </div>

                                                    <p className="text-center pt-8">今は閉じても大丈夫です。<br />
                                                        必要なときに、思い出してください。</p>

                                                    <div className="pt-8 pb-[150px] flex justify-center">
                                                        <button
                                                            className="bg-[#F6E7A6] hover:bg-[#ebd98c] text-[#333333] w-[80%] h-[56px] rounded-2xl font-black text-xl shadow-lg transition-all hover:scale-105 active:brightness-90 active:scale-95 flex items-center justify-center gap-2"
                                                        >
                                                            詳細を確認する
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="mt-20 mb-10 flex justify-center">
                                    <button
                                        onClick={() => setShowModal(null)}
                                        className="bg-[#A8C3A1] hover:bg-[#8da387] text-white min-w-[120px] h-[48px] rounded-full font-black text-2xl shadow-2xl transition-all hover:scale-105 active:brightness-90 active:scale-95 flex items-center justify-center"
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
