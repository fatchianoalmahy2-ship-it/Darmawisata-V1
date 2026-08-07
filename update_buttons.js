const fs = require('fs');
let code = fs.readFileSync('components/angket/AngketForm.tsx', 'utf8');

if (!code.includes("import { Search, AlertCircle")) {
  code = code.replace("import { Search, AlertCircle", "import { Search, AlertCircle, Loader2");
}

code = code.replace(
  `                  onClick={() => triggerNisSearch(seg1, seg2, seg3)}
                  className="ml-auto px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors shrink-0 shadow-xs flex items-center gap-1"
                >
                  <Search className="w-3.5 h-3.5" />
                  Cek NIS
                </button>`,
  `                  onClick={() => triggerNisSearch(seg1, seg2, seg3)}
                  disabled={isSearching}
                  className="ml-auto px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs transition-colors shrink-0 shadow-xs flex items-center gap-1"
                >
                  {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  {isSearching ? 'Mencari...' : 'Cek NIS'}
                </button>`
);

code = code.replace(
  `                  onClick={() => triggerNisSearch('', '', '', inputNis)}
                  className="absolute right-2 top-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Cek
                </button>`,
  `                  onClick={() => triggerNisSearch('', '', '', inputNis)}
                  disabled={isSearching}
                  className="absolute right-2 top-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                >
                  {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  {isSearching ? 'Cek...' : 'Cek'}
                </button>`
);

fs.writeFileSync('components/angket/AngketForm.tsx', code);
console.log('updated buttons');
