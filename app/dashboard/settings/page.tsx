"use client";

import { useState, useEffect } from "react";
import ToolTabs from "@/components/dashboard/ToolTabs";
import { Button } from "@/components/ui/Button";
import {
  Eye,
  EyeOff,
  Save,
  User,
  CreditCard,
  Bot,
  Key,
  Server as ServerIcon,
  Cpu,
} from "lucide-react";
import { getSettings, saveSettings } from "@/app/actions/settings";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [provider, setProvider] = useState("openai");
  const [model, setModel] = useState("gpt-4o");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    // Load settings from DB on mount
    setLoading(true);
    getSettings()
      .then((data) => {
        if (data) {
          setApiKey(data.openai_key || "");
          setProvider(data.provider || "openai");
          setModel(data.openai_model || "gpt-4o");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setStatusMsg("");

    // Fallback store to localStorage
    localStorage.setItem("openai_api_key", apiKey);
    localStorage.setItem("ai_provider", provider);
    localStorage.setItem("ai_model", model);

    const res = await saveSettings({
      openai_key: apiKey,
      provider,
      model,
    });

    if (res.success) {
      setStatusMsg("Configurações salvas com sucesso!");
    } else {
      setStatusMsg("Erro ao salvar: " + res.error);
    }
    setTimeout(() => setStatusMsg(""), 3000);
    setLoading(false);
  };

  const ProfileSettings = () => (
    <div className="bg-surface p-8 rounded-xl border border-primary/10 shadow-sm max-w-2xl">
      <h3 className="text-lg font-bold mb-6 font-display">Perfil do Usuário</h3>
      <div className="flex items-center gap-6 mb-8">
        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center text-primary text-2xl font-bold">
          YT
        </div>
        <div>
          <h4 className="text-xl font-bold">Yan Tech</h4>
          <p className="text-muted">yan.tech@example.com</p>
        </div>
      </div>
      <Button variant="outline">Editar Perfil</Button>
    </div>
  );

  const AISettingsContent = () => (
    <div className="bg-surface p-8 rounded-xl border border-primary/10 shadow-sm max-w-2xl space-y-8">
      <div className="border-b border-primary/10 pb-6">
        <h3 className="text-lg font-bold mb-2 font-display">
          Configuração de IA
        </h3>
        <p className="text-muted text-sm">
          Defina qual inteligência artificial será usada nas ferramentas de
          geração de conteúdo e análise. É necessário estar autenticado.
        </p>
      </div>

      <div className="space-y-6">
        {/* Provider Selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Provedor de IA
          </label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="w-full bg-background border border-primary/20 rounded-md px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors appearance-none"
          >
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
            <option value="gemini">Google Gemini</option>
            <option value="perplexity">Perplexity AI</option>
            <option value="deepseek">DeepSeek</option>
          </select>
        </div>

        {/* Model Selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Modelo
          </label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full bg-background border border-primary/20 rounded-md px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors appearance-none"
          >
            {provider === "openai" && (
              <>
                <optgroup label="GPT-4 & O1">
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="gpt-4o-mini">GPT-4o Mini</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="o1-preview">O1 Preview</option>
                  <option value="o1-mini">O1 Mini</option>
                </optgroup>
                <optgroup label="GPT-3.5">
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                </optgroup>
              </>
            )}
            {provider === "anthropic" && (
              <>
                <option value="claude-3-5-sonnet-20240620">
                  Claude 3.5 Sonnet
                </option>
                <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                <option value="claude-3-sonnet-20240229">
                  Claude 3 Sonnet
                </option>
                <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
              </>
            )}
            {provider === "gemini" && (
              <>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                <option value="gemini-1.0-pro">Gemini 1.0 Pro</option>
              </>
            )}
            {provider === "perplexity" && (
              <>
                <optgroup label="Llama 3">
                  <option value="llama-3-sonar-large-32k-online">
                    Llama 3 Sonar Large Online
                  </option>
                  <option value="llama-3-sonar-small-32k-online">
                    Llama 3 Sonar Small Online
                  </option>
                  <option value="llama-3-70b-instruct">
                    Llama 3 70B Instruct
                  </option>
                  <option value="llama-3-8b-instruct">
                    Llama 3 8B Instruct
                  </option>
                </optgroup>
                <optgroup label="Mixtral">
                  <option value="mixtral-8x7b-instruct">
                    Mixtral 8x7B Instruct
                  </option>
                </optgroup>
              </>
            )}
            {provider === "deepseek" && (
              <>
                <option value="deepseek-chat">DeepSeek Chat</option>
                <option value="deepseek-coder">DeepSeek Coder</option>
              </>
            )}
          </select>
        </div>

        {/* API Key Input */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Chave da API (API Key)
          </label>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={`sk-... (${provider})`}
              className="w-full bg-background border border-primary/20 rounded-md px-4 py-3 pr-12 text-foreground focus:outline-none focus:border-primary transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
            >
              {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p className="text-xs text-muted mt-2">
            Sua chave é armazenada no banco com políticas de acesso por usuário.
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-primary/10 flex flex-col gap-4">
        {statusMsg && (
          <div
            className={cn(
              "p-3 rounded-lg text-sm text-center transition-all animate-in fade-in",
              statusMsg.includes("Erro")
                ? "bg-red-50 text-red-600 border border-red-100"
                : "bg-green-50 text-green-600 border border-green-100"
            )}
          >
            {statusMsg}
          </div>
        )}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              "Salvando..."
            ) : (
              <>
                <Save size={18} />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <ToolTabs
      title="Configurações"
      tabs={[
        { id: "profile", label: "Perfil", component: <ProfileSettings /> },
        {
          id: "ai",
          label: "IA & Integrações",
          component: <AISettingsContent />,
        },
        {
          id: "billing",
          label: "Assinatura",
          component: (
            <div className="p-8 text-muted">
              Gerenciamento de assinatura em breve.
            </div>
          ),
        },
      ]}
    />
  );
}
