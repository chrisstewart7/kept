"use client";

/**
 * Lightweight injected-wallet connector (Phantom / Solflare / Backpack).
 * Uses the window provider standard directly instead of the full
 * wallet-adapter stack — same UX, no SSR friction. Swap for
 * @solana/wallet-adapter-react when the real program integration lands.
 */

import { create } from "zustand";
import { useEffect } from "react";
import { Wallet as WalletIcon, LogOut } from "lucide-react";
import { truncMint } from "@/lib/format";
import { CopyButton } from "./ui";

export interface InjectedProvider {
  isPhantom?: boolean;
  publicKey?: { toString(): string } | null;
  connect(opts?: { onlyIfTrusted?: boolean }): Promise<{
    publicKey: { toString(): string };
  }>;
  disconnect(): Promise<void>;
  signAndSendTransaction?(tx: unknown): Promise<{ signature: string }>;
  signTransaction?(tx: unknown): Promise<unknown>;
}

export function activeProvider(): InjectedProvider | null {
  return provider();
}

declare global {
  interface Window {
    solana?: InjectedProvider;
    solflare?: InjectedProvider;
    backpack?: { solana?: InjectedProvider };
  }
}

export type WalletKind = "phantom" | "solflare" | "backpack";

export const WALLETS: {
  kind: WalletKind;
  name: string;
  installUrl: string;
  mark: string;
}[] = [
  { kind: "phantom", name: "Phantom", installUrl: "https://phantom.com", mark: "P" },
  { kind: "solflare", name: "Solflare", installUrl: "https://solflare.com", mark: "S" },
  { kind: "backpack", name: "Backpack", installUrl: "https://backpack.app", mark: "B" },
];

function providerOf(kind: WalletKind): InjectedProvider | null {
  if (typeof window === "undefined") return null;
  if (kind === "phantom") return window.solana ?? null;
  if (kind === "solflare") return window.solflare ?? null;
  return window.backpack?.solana ?? null;
}

function provider(): InjectedProvider | null {
  if (typeof window === "undefined") return null;
  return window.solana ?? window.solflare ?? window.backpack?.solana ?? null;
}

interface WalletState {
  address: string | null;
  connecting: boolean;
  available: boolean;
  pickerOpen: boolean;
  setAvailable: (v: boolean) => void;
  setPickerOpen: (v: boolean) => void;
  connect: (kind?: WalletKind) => Promise<void>;
  disconnect: () => Promise<void>;
}

export const useWallet = create<WalletState>((set) => ({
  address: null,
  connecting: false,
  available: false,
  pickerOpen: false,
  setAvailable: (v) => set({ available: v }),
  setPickerOpen: (v) => set({ pickerOpen: v }),
  connect: async (kind?: WalletKind) => {
    const p = kind ? providerOf(kind) : provider();
    if (!p) {
      set({ pickerOpen: true });
      return;
    }
    set({ connecting: true });
    try {
      const res = await p.connect();
      set({ address: res.publicKey.toString(), pickerOpen: false });
    } catch {
      /* user rejected */
    } finally {
      set({ connecting: false });
    }
  },
  disconnect: async () => {
    try {
      await provider()?.disconnect();
    } catch {
      /* noop */
    }
    set({ address: null });
  },
}));

/* adapter-style wallet picker */
export function WalletPicker() {
  const { pickerOpen, setPickerOpen, connect, connecting } = useWallet();
  if (!pickerOpen) return null;
  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/25 p-4 backdrop-blur-[2px]"
      onClick={() => setPickerOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Connect a wallet"
    >
      <div
        className="card w-full max-w-xs !rounded-2xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[15px] font-semibold text-ink">Connect a wallet</p>
        <p className="mt-0.5 text-[12px] text-ink-3">
          Solana wallets with the injected provider standard.
        </p>
        <div className="mt-4 space-y-2">
          {WALLETS.map((w) => {
            const detected = !!providerOf(w.kind);
            return (
              <button
                key={w.kind}
                type="button"
                disabled={connecting}
                onClick={() => {
                  if (detected) void connect(w.kind);
                  else window.open(w.installUrl, "_blank", "noopener");
                }}
                className="flex w-full items-center gap-3 rounded-xl border border-line bg-elevated px-3.5 py-2.5 text-left transition-colors hover:border-blue-3 hover:bg-tint"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-soft text-[13px] font-bold text-blue">
                  {w.mark}
                </span>
                <span className="text-[13.5px] font-semibold text-ink">
                  {w.name}
                </span>
                <span
                  className={`ml-auto text-[11px] font-semibold ${detected ? "text-green" : "text-ink-3"}`}
                >
                  {detected ? "Detected" : "Install →"}
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-[10.5px] text-ink-3">
          Only needed to launch. Creators never connect anything.
        </p>
      </div>
    </div>
  );
}

export function WalletButton({ compact = false }: { compact?: boolean }) {
  const { address, connecting, disconnect, setAvailable, setPickerOpen } =
    useWallet();

  useEffect(() => {
    setAvailable(!!provider());
    // silent reconnect if the site is already trusted
    provider()
      ?.connect({ onlyIfTrusted: true })
      .then((r) => useWallet.setState({ address: r.publicKey.toString() }))
      .catch(() => {});
  }, [setAvailable]);

  if (address) {
    return (
      <span className="flex items-center gap-1 rounded-full border border-line bg-elevated py-1 pl-3 pr-1">
        <span className="font-mono text-[12px] text-ink-2">
          {truncMint(address)}
        </span>
        <CopyButton value={address} label="Copy wallet address" />
        <button
          type="button"
          aria-label="Disconnect wallet"
          onClick={disconnect}
          className="flex h-6 w-6 items-center justify-center rounded-md text-ink-3 hover:bg-tint hover:text-ink"
        >
          <LogOut size={13} />
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      className="btn-secondary"
      onClick={() => setPickerOpen(true)}
    >
      <WalletIcon size={15} />
      {compact ? "Connect" : connecting ? "Connecting…" : "Connect wallet"}
    </button>
  );
}

/* Only shown on Launch (§5.16) */
export function ConnectPrompt() {
  const { address, connecting, setPickerOpen } = useWallet();
  if (address) return null;
  return (
    <div className="card flex flex-col items-start gap-3 p-5">
      <p className="text-sm font-semibold text-ink">Connect a wallet to launch</p>
      <p className="text-[13px] text-ink-2">
        Phantom, Solflare, and Backpack are supported. Registering an existing
        token does not require a wallet.
      </p>
      <button
        type="button"
        className="btn-primary"
        onClick={() => setPickerOpen(true)}
      >
        <WalletIcon size={15} />
        {connecting ? "Connecting…" : "Connect wallet"}
      </button>
    </div>
  );
}
