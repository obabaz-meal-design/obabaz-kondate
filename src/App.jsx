import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, RotateCcw, Utensils, Heart, Sparkles, Menu, X, Scale, Coins, ExternalLink } from 'lucide-react';
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
        stapleTemp: '',
        method: '',
        methodOther: '',
        umami: '',
        umamiOther: '',
        salt: '',
        saltOther: '',
        extraSeasonings: [],
        extraSeasoningsOther: '',
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
            stapleTemp: '',
            method: '',
            methodOther: '',
            umami: '',
            umamiOther: '',
            salt: '',
            saltOther: '',
            extraSeasonings: [],
            extraSeasoningsOther: '',
            arrangements: {},
            arrangementsOther: {},
        });
        setActiveArrangementCategory(null);
    };

    const toggleExtraSeasoning = (item) => {
        setFormData(prev => ({
            ...prev,
            extraSeasonings: prev.extraSeasonings.includes(item)
                ? prev.extraSeasonings.filter(i => i !== item)
                : [...prev.extraSeasonings, item]
        }));
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
        const extraNames = (formData.extraSeasonings || [])
            .map(s => {
                if (s === 'その他') {
                    return formData.extraSeasonings.includes('その他') && formData.extraSeasoningsOther.trim()
                        ? formData.extraSeasoningsOther.trim()
                        : null;
                }
                return s;
            })
            .filter(Boolean);
        const { arrangements } = formData;

        // 調理法の名詞化マッピング
        const methodNounMap = {
            '炒める': '炒め',
            '煮る': '煮',
            '焼く': '焼き',
            '和える': '和え',
            '茹でる': '茹で',
            '蒸す': '蒸し',
            '揚げる': '揚げ'
        };
        const methodNoun = methodNounMap[method] || method;

        // 味付けの表現
        const saltPart = salt && salt !== 'その他' ? salt : (formData.saltOther || '');
        const umamiPart = umami && umami !== 'その他' ? umami : (formData.umamiOther || '');
        const seasoningName = saltPart ? `${saltPart}` : (umamiPart ? `${umamiPart}` : '');

        // 短く自然な料理名
        let title = "";
        const mainShort = mainName ? mainName : "";
        const vegShort = vegNames.length > 0 ? vegNames[0] : "";

        if (mainShort && vegShort) {
            title = `${mainShort}と${vegShort}の${seasoningName}${methodNoun}`;
        } else if (mainShort) {
            title = `${mainShort}の${seasoningName}${methodNoun}`;
        } else if (vegShort) {
            title = `${vegNames.slice(0, 2).join('と')}の${seasoningName}${methodNoun}`;
        } else {
            title = `お好み食材の${seasoningName}${methodNoun}`;
        }

        // 主食の補足表示 (「無し（おかずのみ）」以外の場合)
        let stapleSubText = null;
        if (stapleName && stapleName !== '無し（おかずのみ）') {
            stapleSubText = `${stapleName}と合わせる一皿`;
        }

        // アレンジの文字列表現
        const arrEntries = Object.entries(arrangements);
        const arrDescriptions = arrEntries.map(([id, opt]) => {
            const cat = ARRANGEMENTS.find(c => c.id === id);
            const disp = opt === 'その他' ? (formData.arrangementsOther[id] || 'お好み') : opt;
            return `${cat ? cat.label : ''}の${disp}`;
        });

        // 1〜2文程度の短い一皿説明（操作を決めつけず「加えた」などの表現）
        const ingText = [mainName, ...vegNames].filter(Boolean).join('、');
        const seasoningsText = [umami, salt, ...extraNames].filter(Boolean).join('・');
        const arrText = arrDescriptions.length > 0 ? `${arrDescriptions.join('・')}を加えた` : '';
        const description = `${ingText}を${method}、${seasoningsText}の味付けで${formData.stapleTemp || '温製'}に仕立てました。${arrText ? `${arrText}一皿です。` : ''}`;

        // 「あなたが選んだもの」サマリーデータ構造
        const selectedSummary = {
            ingredients: [mainName, ...vegNames].filter(Boolean).join('、') || '未選択',
            staple: stapleName || '未選択',
            method: method || '未選択',
            seasoning: [umami, salt].filter(Boolean).join('・') || '未選択',
            extraSeasoning: extraNames.length > 0 ? extraNames.join('・') : null,
            arrangements: arrDescriptions.length > 0 ? arrDescriptions.join('、') : 'なし',
            temp: formData.stapleTemp || '未選択'
        };

        // AI用プロンプト（アシスタント役割、新【要望】、食品安全維持）
        const prompt = `あなたは、料理について詳しく説明するアシスタントです。
提供された食材と条件を尊重し、利用者が選んだ内容をもとに、詳しいレシピを作成してください。
作る人が理解しやすい、丁寧な言葉遣いで記述してください。

【材料】
- メイン：${mainName}
- 野菜：${vegNames.join('、')}
- 合わせる主食：${stapleName}
- 仕立て：${formData.stapleTemp || '未選択'}

【調理方針】
- 調理法：${method}
- 味のベース：${umami}
- 仕上げの味：${salt}
- 広がる味付け：${extraNames.length > 0 ? extraNames.join('、') : 'なし'}
- アレンジ：${arrDescriptions.length > 0 ? arrDescriptions.join('、') : 'なし'}

【食品安全について】
- 食材に応じて必要な加熱や下処理を行ってください。
- 「和える」を選択している場合も、生食を前提とせず、必要な加熱・下処理を行った後に和える方法として提案してください。
- 食材の安全性を断定せず、最終的な調理判断は利用者が行える表現にしてください。

【要望】
- 材料の分量は目安として示し、何人分を想定したレシピか明記してください。
- ステップごとの調理手順を分かりやすく示してください。
- 利用者が選んだ食材・調理法・味付け・アレンジ・仕立てを尊重してください。
- 選択されていない食材や調味料を必要以上に追加しないでください。
- 必要に応じて、調理しやすくするための補足を添えてください。`;

        return {
            title,
            stapleSubText,
            description,
            selectedSummary,
            prompt
        };
    };

    const recipe = step === 5 ? generateRecipe() : null;

    return (
        <div className="min-h-screen bg-[#F6E7A6] text-obabaz-earth-900 font-sans overflow-x-hidden">
            {/* Header and Step Indicator - Semi-Sticky Container */}
            <div className="sticky top-0 z-[100] bg-[#F6E7A6]/90 backdrop-blur-md px-4 pt-4 shadow-sm">
                <header className="max-w-2xl mx-auto py-4 flex items-start justify-between relative gap-2">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col items-start"
                    >
                        <div className="flex items-center gap-2.5">
                            <Utensils className="w-7 h-7 md:w-9 md:h-9 text-obabaz-warm-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <span className="block text-xs md:text-sm font-bold text-obabaz-earth-600 tracking-wider">obabaz Meal Design</span>
                                <h1 className="text-2xl md:text-3xl font-extrabold text-obabaz-warm-600 leading-tight">こころみ処</h1>
                            </div>
                        </div>
                        <div className="ml-9 md:ml-11 mt-2.5 space-y-1.5 text-obabaz-earth-800 text-xs md:text-sm leading-relaxed">
                            <p className="text-obabaz-earth-600 italic font-medium">〜 季節と今日の気分に寄り添う台所から 〜</p>
                            <p className="font-medium">
                                食材から順番に選んで、<br />
                                今日の一皿を考えてみる場所。
                            </p>
                            <div className="pt-1">
                                <a
                                    href="https://obabaz.com/meal-design/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs md:text-sm text-[#3B6998] font-bold underline underline-offset-4 decoration-[#AFC8E8] decoration-2 hover:text-[#2C5282] transition-colors"
                                >
                                    obabaz Meal Designとは？
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            </div>
                        </div>
                    </motion.div>

                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="flex flex-col items-center justify-center transition-all active:scale-90 active:brightness-90 flex-shrink-0 bg-transparent border-0 shadow-none outline-none appearance-none p-0"
                        aria-label="メニューを開く"
                    >
                        <Menu className="w-8 h-8 text-obabaz-warm-600" />
                        <span className="text-[10px] font-bold text-obabaz-warm-600 mt-0.5">メニュー</span>
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
                                                    maxLength={100}
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
                                                    maxLength={100}
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
                                                maxLength={100}
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
                                                    maxLength={100}
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
                                                    maxLength={100}
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
                                                    maxLength={100}
                                                    placeholder="例：ケチャップ、バルサミコ酢など"
                                                    className="w-full p-5 rounded-2xl border-4 border-[#AFC8E8] focus:border-obabaz-warm-400 outline-none transition-all text-lg bg-white shadow-xl relative z-30"
                                                    value={formData.saltOther}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, saltOther: e.target.value }))}
                                                />
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* さらに広がる「味付け」 */}
                                    <div>
                                        <label className="block text-sm font-bold mb-3 text-obabaz-earth-700">さらに広がる「味付け」<span className="text-xs font-normal text-obabaz-earth-500 ml-2">（複数選択可）</span></label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {SEASONINGS.extra.map(item => {
                                                const isSelected = formData.extraSeasonings.includes(item);
                                                return (
                                                    <button
                                                        key={item}
                                                        onClick={() => toggleExtraSeasoning(item)}
                                                        className={cn(
                                                            "px-3 rounded-full border-2 transition-all font-bold h-[48px] min-h-[48px] text-base w-full flex items-center justify-center flex-shrink-0",
                                                            isSelected
                                                                ? "bg-[#AFC8E8] border-[#AFC8E8] text-white shadow-md transform scale-[1.02]"
                                                                : "bg-white border-obabaz-warm-50 text-obabaz-earth-700 hover:border-obabaz-warm-300"
                                                        )}
                                                    >
                                                        {item}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {formData.extraSeasonings.includes('その他') && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="my-10"
                                            >
                                                <label className="block text-xs font-bold mb-2 text-[#AFC8E8] uppercase tracking-wider">具体的な味付け（広がり）を入力してください</label>
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    maxLength={100}
                                                    placeholder="例：黒糖、米油など"
                                                    className="w-full p-5 rounded-2xl border-4 border-[#AFC8E8] focus:border-obabaz-warm-400 outline-none transition-all text-lg bg-white shadow-xl relative z-30"
                                                    value={formData.extraSeasoningsOther}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, extraSeasoningsOther: e.target.value }))}
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
                                                                            maxLength={100}
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

                                     {/* 仕立て（温度）[必須] */}
                                     <div className="pt-6 border-t border-obabaz-earth-100 mt-6 px-1">
                                         <label className="block text-sm font-bold mb-3 text-obabaz-earth-700">
                                             仕立て（温度） <span className="text-xs text-red-500 font-bold ml-1">※必須</span>
                                         </label>
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

                                    {/* 150px footer spacer to ensure bottom items are not hidden by fixed action buttons */}
                                    <div className="h-[150px] w-full" />
                                </div>
                            )}

                            {step === 5 && recipe && (
                                <div className="space-y-8">
                                    {/* 選んだ内容から生まれた一皿カード */}
                                    <div className="bg-white/95 border-[4px] border-[#AFC8E8] rounded-3xl shadow-xl p-6 md:p-8 relative">
                                        <div className="mb-6">
                                            <h3 className="text-2xl md:text-3xl font-black text-obabaz-earth-900 mb-2">
                                                {recipe.title}
                                            </h3>
                                            {recipe.stapleSubText && (
                                                <p className="text-sm font-bold text-obabaz-earth-600 mb-4">
                                                    {recipe.stapleSubText}
                                                </p>
                                            )}
                                            <p className="text-obabaz-earth-800 leading-relaxed font-medium text-base pt-3 border-t border-obabaz-earth-100">
                                                {recipe.description}
                                            </p>
                                        </div>

                                        {/* あなたが選んだもの（思考順の表示） */}
                                        <div className="mt-8 pt-6 border-t border-dashed border-obabaz-earth-200">
                                            <h4 className="text-sm font-bold text-obabaz-earth-700 mb-4 flex items-center gap-2">
                                                <span>💡</span> あなたが選んだもの
                                            </h4>

                                            <div className="space-y-4 text-sm bg-obabaz-warm-50/50 p-5 rounded-2xl border border-obabaz-warm-100">
                                                {/* 第1段階: 食材・合わせる主食 */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                                                    <div className="space-y-0.5">
                                                        <div className="text-xs font-black text-obabaz-earth-800">食材</div>
                                                        <div className="text-base font-normal text-obabaz-earth-900 leading-normal">{recipe.selectedSummary.ingredients}</div>
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <div className="text-xs font-black text-obabaz-earth-800">合わせる主食</div>
                                                        <div className="text-base font-normal text-obabaz-earth-900 leading-normal">{recipe.selectedSummary.staple}</div>
                                                    </div>
                                                </div>

                                                <div className="text-left text-obabaz-earth-400 font-bold text-xs my-2.5 pl-0.5">↓</div>

                                                {/* 第2段階: 調理法 */}
                                                <div className="space-y-0.5">
                                                    <div className="text-xs font-black text-obabaz-earth-800">調理法</div>
                                                    <div className="text-base font-normal text-obabaz-earth-900 leading-normal">{recipe.selectedSummary.method}</div>
                                                </div>

                                                <div className="text-left text-obabaz-earth-400 font-bold text-xs my-2.5 pl-0.5">↓</div>

                                                {/* 第3段階: 味付け・さらに広がる味付け */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                                                    <div className="space-y-0.5">
                                                        <div className="text-xs font-black text-obabaz-earth-800">味付け</div>
                                                        <div className="text-base font-normal text-obabaz-earth-900 leading-normal">{recipe.selectedSummary.seasoning}</div>
                                                    </div>
                                                    {recipe.selectedSummary.extraSeasoning && (
                                                        <div className="space-y-0.5">
                                                            <div className="text-xs font-black text-obabaz-earth-800">さらに広がる味付け</div>
                                                            <div className="text-base font-normal text-obabaz-earth-900 leading-normal">{recipe.selectedSummary.extraSeasoning}</div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="text-left text-obabaz-earth-400 font-bold text-xs my-2.5 pl-0.5">↓</div>

                                                {/* 第4段階: アレンジ・仕立て */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                                                    <div className="space-y-0.5">
                                                        <div className="text-xs font-black text-obabaz-earth-800">アレンジ</div>
                                                        <div className="text-base font-normal text-obabaz-earth-900 leading-normal">{recipe.selectedSummary.arrangements}</div>
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <div className="text-xs font-black text-obabaz-earth-800">仕立て</div>
                                                        <div className="text-base font-normal text-obabaz-earth-900 leading-normal">{recipe.selectedSummary.temp}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* もう一度考える */}
                                        <div className="mt-8 pt-4 text-center">
                                            <button
                                                onClick={reset}
                                                className="bg-obabaz-earth-800 hover:bg-obabaz-earth-900 text-white px-8 py-3.5 rounded-full font-bold shadow-lg inline-flex items-center gap-2 transition-all hover:scale-105 active:scale-95 text-sm"
                                            >
                                                <RotateCcw className="w-4 h-4" /> もう一度考える
                                            </button>
                                        </div>
                                    </div>

                                    {/* 生成AIへの導線 */}
                                    <div className="pt-6 border-t-2 border-dashed border-obabaz-warm-300 pb-12">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Sparkles className="w-5 h-5 text-obabaz-warm-500" />
                                            <h4 className="font-bold text-lg text-obabaz-earth-800">詳しい作り方を知りたいときは</h4>
                                        </div>
                                        <p className="text-xs text-obabaz-earth-700 mb-4 leading-relaxed font-medium">
                                            あなたが選んだ内容を、生成AIへ渡せるプロンプトにまとめました。コピーしてChatGPTやGeminiなどの生成AIに貼り付けると、詳しいレシピ作成に活用できます。
                                        </p>

                                        <div className="relative group rounded-2xl overflow-hidden shadow-xl border-[3px] border-obabaz-earth-900 bg-obabaz-earth-900">
                                            <div className="flex items-center justify-between px-5 py-2.5 bg-obabaz-earth-800 border-b border-obabaz-earth-700">
                                                <span className="text-obabaz-earth-300 text-xs font-mono font-bold uppercase tracking-widest">AI Prompt</span>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(recipe.prompt);
                                                        const btn = document.getElementById('copy-indicator');
                                                        if (btn) {
                                                            btn.textContent = 'コピー完了！';
                                                            setTimeout(() => btn.textContent = 'コピーする', 2000);
                                                        }
                                                    }}
                                                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded-full text-xs font-bold transition-all border border-white/20 active:scale-95"
                                                >
                                                    <span id="copy-indicator">コピーする</span>
                                                </button>
                                            </div>
                                            <pre className="p-6 text-obabaz-earth-50 text-xs sm:text-sm overflow-x-auto font-mono leading-relaxed max-h-[400px] overflow-y-auto custom-scrollbar-dark text-left whitespace-pre-wrap">
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
                                    (step === 3 && (!formData.umami || !formData.salt)) ||
                                    (step === 4 && !formData.stapleTemp)
                                }
                                className="bg-obabaz-warm-600 hover:bg-obabaz-warm-700 disabled:bg-obabaz-earth-100 disabled:text-obabaz-earth-300 disabled:cursor-not-allowed text-white px-10 py-4 rounded-full font-bold shadow-xl shadow-obabaz-warm-200/50 flex items-center gap-3 transition-all hover:scale-105 active:scale-95"
                            >
                                {step === 4 ? '選んだ一皿を見る' : '次のステップへ'} <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>

                <footer className="mt-12 text-center pb-10">
                    <p className="text-[#C8B7FF] text-xs font-bold mb-4">美味しくなーれ、の気持ちを込めて。</p>
                    <div className="space-y-1 text-[#666666] text-xs font-bold mb-6">
                        <p>運営：obabaz（個人事業）</p>
                        <p>本アプリは無料で利用できます。</p>
                        <p>
                            <button
                                onClick={() => setShowModal('gratitude')}
                                className="hover:text-[#AFC8E8] underline decoration-[#AFC8E8]/30 hover:decoration-[#AFC8E8] transition-all"
                            >
                                開発・運営サポートについて
                            </button>
                        </p>
                    </div>
                    <p className="text-[#C8B7FF] text-[10px] font-bold">
                        &copy; 2026 obabaz Meal Design.
                    </p>
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
                                    <Coins className="w-6 h-6" /> 開発・運営サポートについて
                                </button>
                            </nav>
                            <div className="mt-auto pt-8 pb-12 border-t border-obabaz-earth-200 text-xs text-obabaz-earth-400 font-medium">
                                こころみ処 v1.0
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

                                            <p>効率だけを追い求めるのではなく、その日の気分や体調、買い物のあとに残った野菜や、少ししなびた葉物まで含めて、「美味しくなーれ」という小さな気持ちを、置き去りにしないために。</p>

                                            <p>けれど実際は、献立を決めるだけで、思った以上に心は疲れています。<br />
                                                何を使うか。どう調理するか。どんな味にするか。毎日の献立は、小さな判断の連続です。</p>

                                            <p>レシピを検索すれば答えは出てきます。けれど、それが今の自分に合っているかを決めるのは、また別の思考です。</p>

                                            <p className="font-black text-obabaz-warm-600 pt-4 border-t border-obabaz-warm-100">このアプリは、答えを提示するためのものではありません。</p>

                                            <p>食材 → 調理法 → 味付け → アレンジ と、考える順番を整えることで、一度に抱えていた判断を、ひとつずつに分けていく。<br />
                                                そうして、思考の負担をそっと軽くする。</p>

                                            <p>考えなくていいのに、ちゃんと自分で決めたと思える。その体験をつくるための設計を、大切にしています。</p>

                                            <p>隣で答えを出すのではなく、そっと順番を整える存在でありたい。</p>

                                            <p>そして、その選択が、少しだけ穏やかな時間につながればと願っています。</p>

                                            <div className="mt-8 pt-8 border-t border-obabaz-warm-100 flex flex-col items-start gap-2">
                                                <a
                                                    href="https://obabaz.com/meal-design-app/"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[#AFC8E8] underline font-bold text-lg min-h-[44px] flex items-center hover:opacity-80 transition-opacity"
                                                >
                                                    詳細を確認する
                                                </a>
                                                <a
                                                    href="https://obabaz.com/meal-design-third-party-licenses/"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[#AFC8E8] underline font-bold text-lg min-h-[44px] flex items-center hover:opacity-80 transition-opacity"
                                                >
                                                    OSSライセンス
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {showModal === 'terms' && (
                                    <div className="space-y-12 pt-12 text-[#333333]">
                                        <h2 className="text-4xl md:text-5xl font-black text-[#A8C3A1] mb-12 border-b-8 border-[#A8C3A1]/20 pb-8 tracking-tighter">利用規約</h2>
                                        <div className="space-y-8">
                                            <div className="bg-white/50 p-6 md:p-8 rounded-3xl border border-obabaz-warm-100 shadow-sm">
                                                <h3 className="font-black text-2xl mb-6 border-l-8 border-[#A8C3A1] pl-4">obabaz Meal Design 利用規約</h3>
                                                <p className="text-lg leading-relaxed mb-6 font-bold">こころみ処（以下本アプリ）は、日々の献立作りをサポートするための道具です。<br />ご利用にあたり、以下の内容をご確認ください。</p>

                                                <div className="space-y-8">
                                                    <div>
                                                        <h4 className="font-black text-xl mb-3 flex items-center gap-2">
                                                            <span className="bg-[#A8C3A1] text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-black">1</span>
                                                            <strong>サービスの目的</strong>
                                                        </h4>
                                                        <p className="text-lg leading-relaxed pl-9">
                                                            本アプリは、ユーザーが入力した条件に基づき、AIを通じて献立のヒントやレシピ案を提案するものです。料理の決定や最終判断は、ユーザーご自身の判断に委ねられます。
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <h4 className="font-black text-xl mb-3 flex items-center gap-2">
                                                            <span className="bg-[#A8C3A1] text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-black">2</span>
                                                            <strong>自己判断の原則</strong>
                                                        </h4>
                                                        <p className="text-lg leading-relaxed pl-9">
                                                            AIが生成する情報は、必ずしも正確性・完全性・安全性を保証するものではありません。調理の際は、食材の鮮度や保存状態、十分な加熱、アレルギーの有無、調理器具の安全な使用などを、必ずご自身の判断と責任において確認してください。
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <h4 className="font-black text-xl mb-3 flex items-center gap-2">
                                                            <span className="bg-[#A8C3A1] text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-black">3</span>
                                                            <strong>免責事項</strong>
                                                        </h4>
                                                        <div className="text-lg leading-relaxed pl-9 space-y-4">
                                                            <p>本アプリは、献立作成の補助を目的としたデジタルコンテンツです。提供する情報は参考情報であり、正確性・完全性・有用性を保証するものではありません。</p>
                                                            <p>提供される情報は医学的・栄養学的な専門家による助言に代わるものではありません。</p>
                                                            <p>本サービスの利用により生じた損害については、法令により認められる範囲内で、運営者が適切に対応いたします。</p>
                                                            <p>調理や食材管理、安全確認は、利用者ご自身の判断と責任において行ってください。提供内容をご理解の上、ご自身の判断でご活用ください。</p>
                                                        </div>
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
                                                <div className="mt-12 flex justify-center">
                                                    <a
                                                        href="https://obabaz.com/legal-terms/"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="bg-[#AFC8E8] hover:bg-[#9db8db] text-white w-full max-w-sm h-[56px] rounded-2xl font-black text-lg shadow-lg transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center text-center px-4"
                                                    >
                                                        公式サイトで最新の詳細を確認する
                                                    </a>
                                                </div>
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
                                                <div className="mt-12 flex justify-center">
                                                    <a
                                                        href="https://obabaz.com/legal-privacy-policy/"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="bg-[#AFC8E8] hover:bg-[#9db8db] text-white w-full max-w-sm h-[56px] rounded-2xl font-black text-lg shadow-lg transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center text-center px-4"
                                                    >
                                                        公式サイトで最新の詳細を確認する
                                                    </a>
                                                </div>
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
                                                        <p className="text-xl font-bold">obabaz（屋号）</p>
                                                    </div>
                                                    <div className="border-b border-obabaz-warm-100 pb-4">
                                                        <h3 className="font-black text-lg mb-2 text-obabaz-warm-600"><strong>代表者名</strong></h3>
                                                        <p className="text-xl font-bold">五十嵐 昭子</p>
                                                    </div>
                                                    <div className="border-b border-obabaz-warm-100 pb-4">
                                                        <h3 className="font-black text-lg mb-2 text-obabaz-warm-600"><strong>所在地</strong></h3>
                                                        <p className="text-lg">〒399-9421<br />長野県北安曇郡小谷村中小谷丙4169</p>
                                                    </div>
                                                    <div className="border-b border-obabaz-warm-100 pb-4">
                                                        <h3 className="font-black text-lg mb-2 text-obabaz-warm-600"><strong>電話番号</strong></h3>
                                                        <p className="text-lg">請求があった場合には遅滞なく開示いたします。</p>
                                                    </div>
                                                    <div className="border-b border-obabaz-warm-100 pb-4">
                                                        <h3 className="font-black text-lg mb-2 text-obabaz-warm-600"><strong>メールアドレス</strong></h3>
                                                        <p className="text-lg">info@obabaz.com</p>
                                                    </div>
                                                    <div className="border-b border-obabaz-warm-100 pb-4">
                                                        <h3 className="font-black text-lg mb-2 text-obabaz-warm-600"><strong>提供内容</strong></h3>
                                                        <ul className="list-disc list-inside space-y-2 text-lg">
                                                            <li>体験アプリ【こころみ処】の提供</li>
                                                            <li>本アプリの開発および運営を支えるための任意のサポート決済の受付</li>
                                                        </ul>
                                                    </div>
                                                    <div className="border-b border-obabaz-warm-100 pb-4">
                                                        <h3 className="font-black text-lg mb-2 text-obabaz-warm-600"><strong>販売価格</strong></h3>
                                                        <p className="text-lg">500円（税込）<br />
                                                            <span className="text-sm">※本アプリは無料でご利用いただけます。本決済は任意のサポートであり、支払いの有無により提供内容や機能が変更されることはありません。</span></p>
                                                    </div>
                                                    <div className="border-b border-obabaz-warm-100 pb-4">
                                                        <h3 className="font-black text-lg mb-2 text-obabaz-warm-600"><strong>追加手数料</strong></h3>
                                                        <p className="text-lg">通信料は利用者のご負担となります。</p>
                                                    </div>
                                                    <div className="border-b border-obabaz-warm-100 pb-4">
                                                        <h3 className="font-black text-lg mb-2 text-obabaz-warm-600"><strong>支払方法</strong></h3>
                                                        <p className="text-lg">クレジットカード決済</p>
                                                    </div>
                                                    <div className="border-b border-obabaz-warm-100 pb-4">
                                                        <h3 className="font-black text-lg mb-2 text-obabaz-warm-600"><strong>支払時期</strong></h3>
                                                        <p className="text-lg">決済時に確定します。</p>
                                                    </div>
                                                    <div className="border-b border-obabaz-warm-100 pb-4">
                                                        <h3 className="font-black text-lg mb-2 text-obabaz-warm-600"><strong>提供時期</strong></h3>
                                                        <p className="text-lg">本アプリは常時無料で利用可能です。<br />決済は任意のサポートであり、決済完了後に新たな機能やコンテンツの追加提供はありません。</p>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-black text-lg mb-2 text-obabaz-warm-600"><strong>返品・返金について</strong></h3>
                                                        <p className="text-lg">
                                                            デジタル決済の性質上、決済完了後の返金は原則として承っておりません。ただし、重複決済や決済エラー等が発生した場合は、内容を確認の上、個別に対応いたします。決済に関するご不明点は、
                                                            <a
                                                                href="https://obabaz.com/contact/"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-[#AFC8E8] underline hover:opacity-80 transition-opacity ml-1"
                                                            >
                                                                お問い合わせフォーム
                                                            </a>
                                                            よりご連絡ください。
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="mt-12 flex justify-center border-t border-obabaz-warm-100 pt-12">
                                                    <a
                                                        href="https://obabaz.com/legal-tokushoho/"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="bg-[#AFC8E8] hover:bg-[#9db8db] text-white w-full max-w-sm h-[56px] rounded-2xl font-black text-lg shadow-lg transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center text-center px-4"
                                                    >
                                                        公式サイトで最新の詳細を確認する
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {showModal === 'gratitude' && (
                                    <div className="space-y-12 pt-12 text-[#333333]">
                                        <h2 className="text-4xl md:text-5xl font-black text-[#A8C3A1] mb-12 border-b-8 border-[#A8C3A1]/20 pb-8 tracking-tighter">開発・運営サポートについて</h2>
                                        <div className="space-y-8">
                                            <div className="bg-white/50 p-6 md:p-10 rounded-[3rem] leading-relaxed text-left pl-8 pr-6">
                                                <div className="space-y-6 text-lg md:text-xl">
                                                    <p>こころみ処は、無料でご利用いただける体験型アプリです。<br />
                                                        本ページは、アプリの開発および運営を支えるための任意のサポートについてご案内するものです。</p>

                                                    <div className="bg-[#F6E7A6]/30 p-8 rounded-2xl border border-[#F6E7A6]/50 space-y-4">
                                                        <p className="font-bold">アプリの利用にあたり、お支払いは必要ありません。<br />
                                                            支払いの有無により、提供内容や機能が変更されることはありません。</p>
                                                    </div>

                                                    <div className="space-y-6 pt-6">
                                                        <div>
                                                            <h3 className="font-black text-xl mb-3 flex items-center gap-2 text-obabaz-warm-600"><strong>サポートについて</strong></h3>
                                                            <p>本サポートは、こころみ処の開発・改善および運営（サーバー費用・ドメイン費用等）に充当されます。</p>
                                                            <p className="mt-2 text-lg"><strong>固定額：500円（税込）</strong></p>
                                                        </div>
                                                    </div>

                                                    <div className="pt-4 space-y-2">
                                                        <p>お支払いは任意です。<br />
                                                            今は閉じていただいて構いません。<br />
                                                            必要なときに、思い出していただければ十分です。</p>
                                                    </div>

                                                    <div className="pt-8 flex flex-col items-center">
                                                        <p className="text-sm md:text-base mb-10 text-obabaz-warm-600 font-bold leading-relaxed text-center bg-obabaz-warm-50/50 p-6 rounded-2xl border border-obabaz-warm-100 w-full max-w-sm">
                                                            ※現在、決済システム調整中のため、<br />開発・運営サポートの受付を一時停止しております。<br />再開まで今しばらくお待ちください。
                                                        </p>
                                                        <button
                                                            disabled
                                                            className="bg-obabaz-earth-100 text-obabaz-earth-300 w-full max-w-sm h-[64px] rounded-3xl font-black text-xl shadow-none cursor-not-allowed flex items-center justify-center gap-2 border-2 border-obabaz-earth-200 transition-all"
                                                        >
                                                            ただいま準備中です
                                                        </button>
                                                        <div className="mt-8">
                                                            <button
                                                                onClick={() => setShowModal('legal')}
                                                                className="text-[#AFC8E8] underline font-bold text-sm hover:opacity-80 transition-opacity"
                                                            >
                                                                特定商取引法に基づく表記
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="mt-12 flex justify-start pt-12 border-t border-obabaz-warm-100">
                                                        <a
                                                            href="https://obabaz.com/meal-design-support/"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="bg-transparent text-[#AFC8E8] underline font-bold text-lg min-h-[44px] flex items-center"
                                                        >
                                                            公式サイトで最新の詳細を確認する
                                                        </a>
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
