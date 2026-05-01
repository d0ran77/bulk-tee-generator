import React, { useState, useEffect, useMemo } from 'react';

const FONTS = [
    "Bebas Neue", "Anton", "Archivo Black", "Oswald", 
    "Playfair Display", "Abril Fatface", "DM Serif Display", 
    "Bungee", "Space Grotesk", "Permanent Marker", "Caveat", "Fraunces"
];

const COLORS = [
    { label: 'Dark', hex: '#1a1a1a' },
    { label: 'White', hex: '#FFFFFF' },
    { label: 'Base Gray', hex: '#e8e7e7' },
    { label: 'Brand Orange', hex: '#f28d35' }
];

const saveAs = (content, filename) => {
    const link = document.createElement('a');
    link.href = typeof content === 'string' ? content : URL.createObjectURL(content);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const PRESEEDS = [
    {
        category: "Sarcasm & Vibes",
        items: [
            { name: "Powered By", template: "Powered by coffee and {noun}", values: "chaos\nanxiety\nsarcasm\ntrue crime\ngood vibes\ndry shampoo\ndelusion\nspite\nkarma\noverthinking" },
            { name: "Too X For This", template: "Too {vibe} for this", values: "tired\nintroverted\noverstimulated\nunbothered\ncaffeinated\ncozy\nstressed\nbusy" },
            { name: "World's Okayest", template: "World's Okayest {title}", values: "Brother\nBoss\nGolfer\nFisherman\nGuitar Player\nPlant Mom\nEmployee\nDriver" }
        ]
    },
    {
        category: "Family & Pets",
        items: [
            { name: "Promoted To", template: "Promoted to {role} in 2026", values: "Grandma\nGrandpa\nAuntie\nUncle\nBig Sister\nBig Brother\nDog Mom" },
            { name: "Proud Parent", template: "Proud {pet} Parent", values: "Dog\nCat\nPlant\nReptile\nGuinea Pig\nBunny\nHedgehog\nFerret\nChicken" }
        ]
    },
    {
        category: "Work & Professions",
        items: [
            { name: "Never Wrong", template: "I'm a {job}.\nTo save time, let's just assume I'm always right.", values: "Nurse\nTeacher\nEngineer\nDeveloper\nAccountant\nTherapist\nWriter\nDesigner\nBarista\nChef\nRealtor\nPharmacist" },
            { name: "Off Duty", template: "Off-duty {job}", values: "Nurse\nTeacher\nMom\nParamedic\nDispatch\nChef\nBartender\nLifeguard" }
        ]
    },
    {
        category: "Hobbies & Sports",
        items: [
            { name: "Is My Cardio", template: "{hobby} is my cardio", values: "running\nshopping\noverthinking\nreading\ncrochet\nthrifting\nnapping\nbaking\ngossiping\nscrolling" },
            { name: "Paused My...", template: "I paused my {activity} to be here", values: "game\nanime\nreading\nplaylist\naudiobook\npodcast\ntrue crime show\ncrafting" }
        ]
    },
    {
        category: "Events & Retro",
        items: [
            { name: "Vintage Year", template: "Vintage {year}\nLimited Edition", values: Array.from({length: 20}, (_, i) => (1975 + i).toString()).join('\n') },
            { name: "Team Name", template: "Team {name}", values: "Smith\nJohnson\nBride\nGroom\nIntrovert\nExtrovert\nNo Sleep" }
        ]
    }
];

const INITIAL_SETTINGS = {
    font: 'Bebas Neue',
    textColor: '#1a1a1a',
    bgPreview: 'transparent',
    textAlign: 'center',
    lineBreakMode: 'single',
    letterSpacing: 0,
    textTransform: 'uppercase',
    maxWidth: 90,
    fontSize: 50
};

const formatDesignText = (text, mode) => {
    if (!text) return "";
    let t = text.trim();
    if (mode === 'single') return t.replace(/\s+/g, ' ');
    if (mode === 'word') return t.split(/\s+/).join('\n');
    if (mode === 'split') {
        const words = t.split(/\s+/);
        if (words.length <= 1) return t;
        const half = Math.ceil(words.length / 2);
        return words.slice(0, half).join(' ') + '\n' + words.slice(half).join(' ');
    }
    return t;
};

// Embedded Brutalist CSS
const customStyles = `
    body { background-color: #e8e7e7; color: #1a1a1a; }
    .bg-checker {
        background-color: #e8e7e7;
        background-image:  linear-gradient(45deg, #d1d1d1 25%, transparent 25%), linear-gradient(-45deg, #d1d1d1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #d1d1d1 75%), linear-gradient(-45deg, transparent 75%, #d1d1d1 75%);
        background-size: 20px 20px;
        background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
    }
    .brutal-input {
        width: 100%;
        border: 3px solid #1a1a1a;
        padding: 0.75rem;
        background: #fff;
        color: #1a1a1a;
        transition: all 0.1s;
    }
    .brutal-input:focus {
        outline: none;
        box-shadow: 4px 4px 0px 0px #1a1a1a;
        transform: translate(-2px, -2px);
    }
    .brutal-btn {
        border: 3px solid #1a1a1a;
        font-weight: 800;
        text-transform: uppercase;
        box-shadow: 4px 4px 0px 0px #1a1a1a;
        transition: all 0.1s;
        cursor: pointer;
    }
    .brutal-btn:active:not(:disabled) {
        box-shadow: 1px 1px 0px 0px #1a1a1a;
        transform: translate(3px, 3px);
    }
    .brutal-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        box-shadow: none;
        transform: translate(4px, 4px);
    }
    ::-webkit-scrollbar { width: 10px; height: 10px; }
    ::-webkit-scrollbar-track { background: #e8e7e7; border-left: 3px solid #1a1a1a; }
    ::-webkit-scrollbar-thumb { background: #f28d35; border: 3px solid #1a1a1a; }
`;

export default function App() {
    const [template, setTemplate] = useState(PRESEEDS[0].items[0].template);
    const [values, setValues] = useState(PRESEEDS[0].items[0].values);
    const [settings, setSettings] = useState(INITIAL_SETTINGS);
    
    const [savedTemplates, setSavedTemplates] = useState([]);
    const [isExporting, setIsExporting] = useState(false);
    const [enlargedDesign, setEnlargedDesign] = useState(null);

    // Inject Google Fonts and external libraries on mount
    useEffect(() => {
        // Fallback: Inject Tailwind via CDN so it works even if local build fails
        const tailwindScript = document.createElement('script');
        tailwindScript.src = 'https://cdn.tailwindcss.com';
        document.head.appendChild(tailwindScript);

        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Anton&family=Archivo+Black&family=Bebas+Neue&family=Bungee&family=Caveat&family=DM+Serif+Display&family=Fraunces:opsz,wght@9..144,700&family=Oswald:wght@700&family=Permanent+Marker&family=Playfair+Display:wght@700&family=Space+Grotesk:wght@700&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);

        const html2canvasScript = document.createElement('script');
        html2canvasScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        document.head.appendChild(html2canvasScript);

        const jsZipScript = document.createElement('script');
        jsZipScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
        document.head.appendChild(jsZipScript);
    }, []);

    // Load saved templates from LocalStorage
    useEffect(() => {
        const saved = localStorage.getItem('bulkTeeTemplates');
        if (saved) {
            try {
                setSavedTemplates(JSON.parse(saved));
            } catch (e) {
                console.error("Could not parse saved templates");
            }
        }
    }, []);

    const saveCurrentTemplate = () => {
        const newTpl = {
            id: Date.now(),
            name: template.slice(0, 15) + (template.length > 15 ? '...' : ''),
            template,
            values,
            settings
        };
        const updated = [...savedTemplates, newTpl];
        setSavedTemplates(updated);
        localStorage.setItem('bulkTeeTemplates', JSON.stringify(updated));
    };

    const loadSavedTemplate = (t) => {
        setTemplate(t.template);
        setValues(t.values);
        setSettings({ ...INITIAL_SETTINGS, ...t.settings });
    };

    const removeSavedTemplate = (id, e) => {
        e.stopPropagation();
        const updated = savedTemplates.filter(t => t.id !== id);
        setSavedTemplates(updated);
        localStorage.setItem('bulkTeeTemplates', JSON.stringify(updated));
    };

    const loadPreseed = (p) => {
        setTemplate(p.template);
        setValues(p.values);
    };

    const copyPrompt = (e) => {
        const promptText = `Give me a list of 30 funny, relatable, and highly niche ideas for "${template.match(/\{([^}]+)\}/)?.[1] || 'hobby'}" to use in a t-shirt design. Format the output as a simple list with one idea per line, no bullet points, numbers, or extra text.`;
        const textArea = document.createElement("textarea");
        textArea.value = promptText;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            const btn = e.currentTarget;
            const originalText = btn.innerText;
            btn.innerText = "COPIED!";
            btn.classList.add("bg-[#1a1a1a]", "text-white");
            setTimeout(() => {
                btn.innerText = originalText;
                btn.classList.remove("bg-[#1a1a1a]", "text-white");
            }, 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
        document.body.removeChild(textArea);
    };

    const designs = useMemo(() => {
        if(!template.trim()) return [];
        const placeholders = (template.match(/\{([^}]+)\}/g) || []).map(p => p.slice(1, -1));
        const lines = values.split('\n').map(l => l.trim()).filter(l => l);

        let results = [];
        if (placeholders.length === 0) {
            results.push({ id: 'd-0', text: template, slug: 'design' });
        } else if (placeholders.length === 1) {
            results = lines.map((line, idx) => ({
                id: `d-${idx}`,
                text: template.replace(new RegExp(`\\{${placeholders[0]}\\}`, 'g'), line),
                slug: line.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `design-${idx}`
            }));
        } else {
            if (lines.length > 1) {
                const headers = lines[0].split(',').map(h => h.trim());
                for (let i = 1; i < lines.length; i++) {
                    const vals = lines[i].split(',').map(v => v.trim());
                    let text = template;
                    let slugParts = [];
                    headers.forEach((h, idx) => {
                        text = text.replace(new RegExp(`\\{${h}\\}`, 'g'), vals[idx] || '');
                        slugParts.push(vals[idx] || '');
                    });
                    results.push({ 
                        id: `d-${i}`, 
                        text, 
                        slug: slugParts.join('-').toLowerCase().replace(/[^a-z0-9]+/g, '-') || `design-${i}` 
                    });
                }
            }
        }
        return results;
    }, [template, values]);

    const downloadSingle = async (design, e) => {
        if (e) e.stopPropagation();
        if (!window.html2canvas) {
            console.error("html2canvas not loaded yet");
            return;
        }
        setIsExporting(true);
        try {
            const node = document.getElementById(design.id);
            const canvas = await window.html2canvas(node, {
                backgroundColor: null,
                scale: 15,
                useCORS: true,
                logging: false
            });
            const url = canvas.toDataURL("image/png");
            let tplSlug = template.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 20);
            saveAs(url, `${tplSlug}-${design.slug}.png`);
        } catch (err) {
            console.error(err);
        }
        setIsExporting(false);
    };

    const downloadAll = async () => {
        if (designs.length === 0) return;
        if (!window.html2canvas || !window.JSZip) {
            console.error("Libraries not loaded yet");
            return;
        }
        setIsExporting(true);
        try {
            const zip = new window.JSZip();
            const folder = zip.folder("designs");
            let tplSlug = template.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 20);

            for (let i = 0; i < designs.length; i++) {
                const d = designs[i];
                const node = document.getElementById(d.id);
                if (node) {
                    const canvas = await window.html2canvas(node, {
                        backgroundColor: null,
                        scale: 15,
                        useCORS: true,
                        logging: false
                    });
                    const data = canvas.toDataURL('image/png').split(',')[1];
                    folder.file(`${tplSlug}-${d.slug}.png`, data, {base64: true});
                }
            }
            const content = await zip.generateAsync({type: "blob"});
            saveAs(content, `${tplSlug}-bulk-designs.zip`);
        } catch (err) {
            console.error(err);
        }
        setIsExporting(false);
    };

    const getBgClass = () => {
        if (settings.bgPreview === 'white') return 'bg-white';
        if (settings.bgPreview === 'black') return 'bg-[#1a1a1a]';
        return 'bg-checker';
    };

    const updateSetting = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    return (
        <>
            {/* Inject Custom CSS */}
            <style dangerouslySetInnerHTML={{ __html: customStyles }} />

            <div className="min-h-screen flex flex-col font-sans">
                {/* Header */}
                <header className="border-b-4 border-[#1a1a1a] p-4 bg-[#f28d35] flex items-center justify-between z-10 text-[#1a1a1a]">
                    <h1 className="text-3xl font-black uppercase tracking-tighter">Bulk Tee Generator</h1>
                    <div className="text-sm font-bold border-2 border-[#1a1a1a] px-2 py-1 bg-white text-[#1a1a1a] hidden sm:block">
                        Standard Output: 4500x5400px @ 300DPI
                    </div>
                </header>

                {/* Main Layout */}
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                    
                    {/* LEFT PANEL: Builder */}
                    <div className="lg:w-1/4 w-full border-r-4 border-[#1a1a1a] p-6 bg-[#e8e7e7] overflow-y-auto flex flex-col gap-6 text-[#1a1a1a]">
                        <div>
                            <h2 className="text-xl font-bold uppercase mb-4 border-b-4 border-[#1a1a1a] inline-block">Template Builder</h2>
                            
                            {savedTemplates.length > 0 && (
                                <div className="mb-4 flex flex-wrap gap-2">
                                    {savedTemplates.map(t => (
                                        <div key={t.id} onClick={() => loadSavedTemplate(t)} className="bg-white border-2 border-[#1a1a1a] px-3 py-1 text-xs font-bold cursor-pointer hover:bg-[#f28d35] hover:text-[#1a1a1a] transition flex items-center gap-2">
                                            {t.name}
                                            <span onClick={(e) => removeSavedTemplate(t.id, e)} className="text-[#1a1a1a] hover:text-white text-base leading-none">&times;</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="mb-6 bg-white border-4 border-[#1a1a1a] p-4 shadow-[4px_4px_0px_0px_#1a1a1a]">
                                <h3 className="font-black uppercase mb-3 text-lg border-b-2 border-[#1a1a1a] pb-1">Template Library</h3>
                                <div className="flex flex-col gap-4">
                                    {PRESEEDS.map((group, i) => (
                                        <div key={i}>
                                            <span className="text-[10px] font-bold text-[#1a1a1a]/60 uppercase block mb-1">{group.category}</span>
                                            <div className="flex flex-wrap gap-1">
                                                {group.items.map((p, j) => (
                                                    <button key={j} onClick={() => loadPreseed(p)} className="text-[11px] font-bold border-2 border-[#1a1a1a] bg-[#e8e7e7] px-2 py-1 hover:bg-[#f28d35] hover:text-[#1a1a1a] transition-colors uppercase">
                                                        {p.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <label className="block font-bold text-sm mb-1 uppercase">Template text</label>
                            <p className="text-xs text-[#1a1a1a]/70 mb-2 font-medium">Use {`{placeholder}`} syntax.</p>
                            <input 
                                type="text" 
                                className="brutal-input mb-4 font-mono text-sm border-[#1a1a1a]"
                                value={template}
                                onChange={e => setTemplate(e.target.value)}
                            />

                            <div className="flex justify-between items-end mb-1">
                                <label className="block font-bold text-sm uppercase">Values</label>
                                <button onClick={() => setValues('')} className="text-[10px] font-bold text-red-600 hover:underline uppercase">Clear Values</button>
                            </div>
                            <p className="text-xs text-[#1a1a1a]/70 mb-2 font-medium">One per line. For multiple placeholders, use CSV format (first row = headers).</p>
                            <textarea 
                                className="brutal-input h-48 font-mono text-sm whitespace-pre mb-2"
                                value={values}
                                onChange={e => setValues(e.target.value)}
                            ></textarea>

                            {/* AI Prompt Helper */}
                            <div className="mt-4 p-4 border-4 border-[#1a1a1a] bg-white shadow-[4px_4px_0px_0px_#1a1a1a]">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-black uppercase text-[#f28d35] flex items-center gap-2">
                                        💡 Need more ideas?
                                    </span>
                                    <button onClick={copyPrompt} className="text-[10px] font-bold border-2 border-[#1a1a1a] px-2 py-1 hover:bg-[#f28d35] hover:text-[#1a1a1a] transition-colors">
                                        COPY PROMPT
                                    </button>
                                </div>
                                <p className="text-xs text-[#1a1a1a] mb-2 font-medium">Copy & paste this into Claude/ChatGPT to generate a huge list just like in the video!</p>
                                <code className="block p-2 bg-[#e8e7e7] border-2 border-[#1a1a1a] select-all text-xs font-mono text-[#1a1a1a]">
                                    Give me a list of 30 funny, relatable, and highly niche ideas for "{template.match(/\{([^}]+)\}/)?.[1] || 'hobby'}" to use in a t-shirt design. Format the output as a simple list with one idea per line, no bullet points, numbers, or extra text.
                                </code>
                            </div>
                        </div>

                        <button onClick={saveCurrentTemplate} className="brutal-btn bg-[#f28d35] text-[#1a1a1a] py-3 mt-auto hover:bg-[#1a1a1a] hover:text-[#f28d35]">
                            Save Setup
                        </button>
                    </div>

                    {/* MIDDLE PANEL: Controls */}
                    <div className="lg:w-1/4 w-full border-r-4 border-[#1a1a1a] p-6 bg-white overflow-y-auto flex flex-col gap-5 text-[#1a1a1a]">
                        <h2 className="text-xl font-bold uppercase mb-2 border-b-4 border-[#1a1a1a] inline-block">Design Controls</h2>

                        <div>
                            <label className="block font-bold text-sm mb-2 uppercase">Typography</label>
                            <select 
                                className="brutal-input mb-4 text-lg" 
                                value={settings.font} 
                                onChange={e => updateSetting('font', e.target.value)}
                                style={{ fontFamily: `"${settings.font}", sans-serif` }}
                            >
                                {FONTS.map(f => (
                                    <option key={f} value={f} style={{ fontFamily: `"${f}", sans-serif` }}>{f}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block font-bold text-sm mb-2 uppercase">Text Color</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {COLORS.map(c => (
                                    <button 
                                        key={c.hex} 
                                        onClick={() => updateSetting('textColor', c.hex)}
                                        className={`w-8 h-8 border-2 border-[#1a1a1a] ${settings.textColor === c.hex ? 'ring-2 ring-offset-2 ring-[#1a1a1a]' : ''}`}
                                        style={{ backgroundColor: c.hex }}
                                        title={c.label}
                                    />
                                ))}
                                <input 
                                    type="color" 
                                    value={settings.textColor} 
                                    onChange={e => updateSetting('textColor', e.target.value)}
                                    className="w-8 h-8 border-2 border-[#1a1a1a] p-0 m-0 cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="border-t-2 border-[#1a1a1a] pt-4">
                            <label className="block font-bold text-sm mb-2 uppercase">Preview Background</label>
                            <div className="flex border-2 border-[#1a1a1a]">
                                <button onClick={() => updateSetting('bgPreview', 'transparent')} className={`flex-1 py-1 font-bold text-xs uppercase border-r-2 border-[#1a1a1a] ${settings.bgPreview === 'transparent' ? 'bg-[#f28d35] text-[#1a1a1a]' : 'bg-[#e8e7e7] text-[#1a1a1a]'}`}>Transp</button>
                                <button onClick={() => updateSetting('bgPreview', 'white')} className={`flex-1 py-1 font-bold text-xs uppercase border-r-2 border-[#1a1a1a] ${settings.bgPreview === 'white' ? 'bg-[#f28d35] text-[#1a1a1a]' : 'bg-[#e8e7e7] text-[#1a1a1a]'}`}>White</button>
                                <button onClick={() => updateSetting('bgPreview', 'black')} className={`flex-1 py-1 font-bold text-xs uppercase ${settings.bgPreview === 'black' ? 'bg-[#f28d35] text-[#1a1a1a]' : 'bg-[#e8e7e7] text-[#1a1a1a]'}`}>Black</button>
                            </div>
                            <p className="text-xs mt-1 text-[#1a1a1a]/70 font-bold">*Export is always transparent.</p>
                        </div>

                        <div className="border-t-2 border-[#1a1a1a] pt-4">
                            <label className="block font-bold text-sm mb-2 uppercase">Alignment & Layout</label>
                            <select className="brutal-input mb-3" value={settings.textAlign} onChange={e => updateSetting('textAlign', e.target.value)}>
                                <option value="left">Left Align</option>
                                <option value="center">Center Align</option>
                                <option value="right">Right Align</option>
                            </select>

                            <select className="brutal-input mb-3" value={settings.lineBreakMode} onChange={e => updateSetting('lineBreakMode', e.target.value)}>
                                <option value="single">Single Line</option>
                                <option value="word">Word Per Line (Stacked)</option>
                                <option value="split">Two-Line Split</option>
                            </select>
                            
                            <select className="brutal-input mb-3" value={settings.textTransform} onChange={e => updateSetting('textTransform', e.target.value)}>
                                <option value="uppercase">UPPERCASE</option>
                                <option value="lowercase">lowercase</option>
                                <option value="none">As Typed</option>
                            </select>
                        </div>

                        <div className="border-t-2 border-[#1a1a1a] pt-4 space-y-4">
                            <div>
                                <label className="flex justify-between font-bold text-sm mb-1 uppercase">
                                    <span>Font Size</span> <span>{settings.fontSize}</span>
                                </label>
                                <input type="range" min="10" max="250" value={settings.fontSize} onChange={e => updateSetting('fontSize', e.target.value)} className="w-full accent-[#f28d35]" />
                            </div>
                            
                            <div>
                                <label className="flex justify-between font-bold text-sm mb-1 uppercase">
                                    <span>Letter Spacing</span> <span>{settings.letterSpacing}px</span>
                                </label>
                                <input type="range" min="-10" max="50" value={settings.letterSpacing} onChange={e => updateSetting('letterSpacing', e.target.value)} className="w-full accent-[#f28d35]" />
                            </div>

                            <div>
                                <label className="flex justify-between font-bold text-sm mb-1 uppercase">
                                    <span>Max Width (%)</span> <span>{settings.maxWidth}%</span>
                                </label>
                                <input type="range" min="10" max="100" value={settings.maxWidth} onChange={e => updateSetting('maxWidth', e.target.value)} className="w-full accent-[#f28d35]" />
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL: Preview Grid */}
                    <div className="lg:w-2/4 w-full p-6 bg-[#e8e7e7] overflow-y-auto flex flex-col relative text-[#1a1a1a]">
                        <div className="flex justify-between items-end mb-6 border-b-4 border-[#1a1a1a] pb-4 sticky top-0 bg-[#e8e7e7] z-20 pt-2">
                            <div>
                                <h2 className="text-xl font-bold uppercase">Generated Designs</h2>
                                <p className="text-sm font-bold text-[#f28d35]">{designs.length} Variations Generated</p>
                            </div>
                            <button 
                                onClick={downloadAll} 
                                disabled={isExporting || designs.length === 0}
                                className="brutal-btn bg-[#f28d35] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-[#f28d35] px-6 py-3 text-lg flex gap-2 items-center"
                            >
                                {isExporting ? 'Packaging Zip...' : 'Download All (ZIP)'}
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-6 justify-center">
                            {designs.map((design) => (
                                <div key={design.id} className="flex flex-col gap-2">
                                    <div 
                                        className={`w-[300px] h-[360px] relative border-4 border-[#1a1a1a] shrink-0 cursor-pointer group ${getBgClass()}`}
                                        onClick={() => setEnlargedDesign(design)}
                                        title="Click to enlarge"
                                    >
                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-[#1a1a1a]/10 hidden group-hover:flex items-center justify-center z-10 pointer-events-none">
                                            <span className="bg-white border-2 border-[#1a1a1a] px-3 py-1 font-bold uppercase shadow-[4px_4px_0px_0px_#1a1a1a] text-sm text-[#1a1a1a]">View Large</span>
                                        </div>

                                        {/* EXPORT TARGET: Transparent bg, scales perfectly up to 4500x5400 via html2canvas */}
                                        <div id={design.id} className="w-[300px] h-[360px] flex items-center justify-center absolute top-0 left-0 bg-transparent">
                                            <div style={{
                                                fontFamily: `"${settings.font}", sans-serif`,
                                                color: settings.textColor,
                                                textAlign: settings.textAlign,
                                                letterSpacing: `${settings.letterSpacing}px`,
                                                textTransform: settings.textTransform,
                                                fontSize: `${settings.fontSize}px`,
                                                maxWidth: `${settings.maxWidth}%`,
                                                whiteSpace: 'pre-wrap',
                                                lineHeight: '1.1',
                                                wordBreak: 'break-word'
                                            }}>
                                                {formatDesignText(design.text, settings.lineBreakMode)}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center w-[300px]">
                                        <span className="text-xs font-bold text-[#1a1a1a] truncate max-w-[180px] bg-white border-2 border-[#1a1a1a] px-1">{design.slug}.png</span>
                                        <button 
                                            onClick={(e) => downloadSingle(design, e)}
                                            disabled={isExporting}
                                            className="brutal-btn bg-[#f28d35] text-[#1a1a1a] px-3 py-1 text-xs hover:bg-[#1a1a1a] hover:text-[#f28d35]"
                                        >
                                            PNG
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {designs.length === 0 && (
                                <div className="w-full text-center py-20 font-bold text-[#1a1a1a]/40 uppercase text-2xl">
                                    No designs to show.<br/>Check your template and values.
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* ENLARGED MODAL */}
                {enlargedDesign && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1a1a]/80 p-4 backdrop-blur-sm" onClick={() => setEnlargedDesign(null)}>
                        <div className="bg-white border-4 border-[#1a1a1a] p-6 flex flex-col items-center shadow-[6px_6px_0px_0px_#1a1a1a] max-w-full max-h-full" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between w-full mb-4 items-center">
                                <h2 className="text-xl font-black uppercase tracking-tight text-[#1a1a1a]">{enlargedDesign.slug}</h2>
                                <button onClick={() => setEnlargedDesign(null)} className="brutal-btn bg-[#e8e7e7] text-[#1a1a1a] px-3 py-1 hover:bg-[#f28d35]">CLOSE X</button>
                            </div>
                            
                            {/* Enlarged Preview Container (Scaled via CSS) */}
                            <div className={`w-[450px] h-[540px] relative border-4 border-[#1a1a1a] shrink-0 overflow-hidden ${getBgClass()}`}>
                                <div style={{ transform: 'scale(1.5)', transformOrigin: 'top left' }} className="w-[300px] h-[360px] absolute top-0 left-0 flex items-center justify-center">
                                    <div style={{
                                        fontFamily: `"${settings.font}", sans-serif`,
                                        color: settings.textColor,
                                        textAlign: settings.textAlign,
                                        letterSpacing: `${settings.letterSpacing}px`,
                                        textTransform: settings.textTransform,
                                        fontSize: `${settings.fontSize}px`,
                                        maxWidth: `${settings.maxWidth}%`,
                                        whiteSpace: 'pre-wrap',
                                        lineHeight: '1.1',
                                        wordBreak: 'break-word'
                                    }}>
                                        {formatDesignText(enlargedDesign.text, settings.lineBreakMode)}
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={() => { downloadSingle(enlargedDesign); setEnlargedDesign(null); }}
                                className="brutal-btn bg-[#f28d35] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-[#f28d35] w-full mt-6 py-3 text-lg"
                            >
                                Download High-Res PNG
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </>
    );
}