package com.example.Quora.services;

import com.example.Quora.dtos.DebateResponseDto;
import com.example.Quora.models.Debate;
import com.example.Quora.models.DebateVote;
import com.example.Quora.models.Question;
import com.example.Quora.models.User;
import com.example.Quora.repository.DebateRepository;
import com.example.Quora.repository.DebateVoteRepository;
import com.example.Quora.repository.QuestionRepository;
import com.example.Quora.repository.UserRepository;
import com.example.Quora.exceptions.ResourceNotFoundException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Optional;

@Service
public class DebateService {

    @Value("${OPENAI_API_KEY:}")
    private String openaiApiKey;

    @Value("${OPENAI_MODEL:}")
    private String openaiModel;

    @Value("${GEMINI_API_KEY:}")
    private String geminiApiKey;

    @Value("${AI_PROVIDER:GEMINI}")
    private String aiProvider;

    @Value("${GEMINI_MODEL:gemini-1.5-flash}")
    private String geminiModel;

    @Value("${GROQ_API_KEY:}")
    private String groqApiKey;

    @Value("${GROQ_MODEL:llama3-8b-8192}")
    private String groqModel;

    private final DebateRepository debateRepository;
    private final DebateVoteRepository debateVoteRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public DebateService(
            DebateRepository debateRepository,
            DebateVoteRepository debateVoteRepository,
            QuestionRepository questionRepository,
            UserRepository userRepository) {
        this.debateRepository = debateRepository;
        this.debateVoteRepository = debateVoteRepository;
        this.questionRepository = questionRepository;
        this.userRepository = userRepository;
        this.objectMapper = new ObjectMapper();
        this.httpClient = HttpClient.newHttpClient();
    }

    @Transactional
    public DebateResponseDto generateDebate(Long questionId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));

        // Check if debate already exists
        Optional<Debate> existingDebate = debateRepository.findByQuestionId(questionId);
        if (existingDebate.isPresent()) {
            return mapToDto(existingDebate.get(), null);
        }

        // Generate debate using AI
        AiDebateResult aiDebateResult = generateAiDebate(question.getTitle() + " " + question.getContent());
        if (aiDebateResult == null || aiDebateResult.content == null || aiDebateResult.content.isBlank()) {
            throw new RuntimeException("Failed to generate debate using AI");
        }

        // Parse AI response
        DebateContent parsed = parseDebateContent(aiDebateResult.content);

        // Save debate
        Debate debate = new Debate();
        debate.setQuestion(question);
        debate.setProText(parsed.pro);
        debate.setAgainstText(parsed.against);
        debate.setSummary(parsed.summary);
        debate.setAiProvider(aiDebateResult.provider);

        Debate saved = debateRepository.save(debate);
        return mapToDto(saved, null);
    }

    @Transactional
    public DebateResponseDto voteOnDebate(Long debateId, Long userId, String vote) {
        if (!("PRO".equalsIgnoreCase(vote) || "AGAINST".equalsIgnoreCase(vote))) {
            throw new IllegalArgumentException("Vote must be PRO or AGAINST");
        }

        Debate debate = debateRepository.findById(debateId)
                .orElseThrow(() -> new ResourceNotFoundException("Debate not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check if user already voted
        Optional<DebateVote> existingVote = debateVoteRepository.findByDebateIdAndUserId(debateId, userId);

        if (existingVote.isPresent()) {
            // Update vote
            existingVote.get().setVote(vote.toUpperCase());
            debateVoteRepository.save(existingVote.get());
        } else {
            // Create new vote
            DebateVote newVote = new DebateVote(debate, user, vote.toUpperCase());
            debate.getVotes().add(newVote);
            debateRepository.save(debate);
        }

        return mapToDto(debate, userId);
    }

    @Transactional(readOnly = true)
    public DebateResponseDto getDebate(Long questionId, Long userId) {
        Debate debate = debateRepository.findByQuestionId(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Debate not found for this question"));
        return mapToDto(debate, userId);
    }

    private AiDebateResult generateAiDebate(String topic) {
        String preferredProvider = aiProvider == null ? "" : aiProvider.trim().toUpperCase();

        switch (preferredProvider) {

            case "GROQ":
                AiDebateResult groq = tryGroq(topic);
                if (groq != null)
                    return groq;

                AiDebateResult gemini = tryGemini(topic);
                if (gemini != null)
                    return gemini;

                return tryOpenAi(topic);

            case "OPENAI":
                AiDebateResult openai = tryOpenAi(topic);
                if (openai != null)
                    return openai;

                return tryGemini(topic);

            default:
                AiDebateResult g = tryGemini(topic);
                if (g != null)
                    return g;

                return tryOpenAi(topic);
        }
    }

    private AiDebateResult tryGemini(String topic) {
        if (geminiApiKey == null || geminiApiKey.isBlank()) {
            System.err.println("Gemini API key is not configured.");
            return null;
        }

        try {
            return new AiDebateResult(callGeminiApi(topic), "GEMINI");
        } catch (Exception e) {
            System.err.println("Gemini API error: " + e.getMessage());
            return null;
        }
    }

    private AiDebateResult tryOpenAi(String topic) {
        if (openaiApiKey == null || openaiApiKey.isBlank()) {
            System.err.println("OpenAI API key is not configured.");
            return null;
        }

        try {
            return new AiDebateResult(callOpenAiApi(topic), "OPENAI");
        } catch (Exception e) {
            System.err.println("OpenAI API error: " + e.getMessage());
            return null;
        }
    }

    private AiDebateResult tryGroq(String topic) {

        if (groqApiKey == null || groqApiKey.isBlank()) {
            return null;
        }

        try {
            return new AiDebateResult(callGroqApi(topic), "GROQ");
        } catch (Exception e) {
            System.err.println("Groq API error: " + e.getMessage());
            return null;
        }
    }

    private String callGroqApi(String topic) throws Exception {
        String prompt = """
                You are an AI debate generator.

                Return ONLY valid JSON.

                Do not include markdown.
                Do not include explanation.
                Do not wrap in ```json.

                Topic:
                %s

                JSON format:
                {
                  "pro": "Write a detailed supporting argument in 5-7 sentences.",
                  "against": "Write a detailed opposing argument in 5-7 sentences.",
                  "summary": "Write a balanced conclusion in 3-4 sentences."
                }
                """.formatted(topic);

        String requestBody = objectMapper.writeValueAsString(new Object() {
            public String model = groqModel;

            public Object[] messages = new Object[] {
                    new Object() {
                        public String role = "user";
                        public String content = prompt;
                    }
            };

            public double temperature = 0.7;
        });

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.groq.com/openai/v1/chat/completions"))
                .header("Authorization", "Bearer " + groqApiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException(response.body());
        }

        JsonNode json = objectMapper.readTree(response.body());

        return json.get("choices")
                .get(0)
                .get("message")
                .get("content")
                .asText();
    }

    private String callOpenAiApi(String topic) throws Exception {
        String prompt = "Generate a debate for this topic in JSON format:\n" +
                "Topic: " + topic + "\n\n" +
                "Return JSON:\n" +
                "{\n" +
                "  \"pro\": \"3-4 sentences supporting this topic\",\n" +
                "  \"against\": \"3-4 sentences opposing this topic\",\n" +
                "  \"summary\": \"2 sentences balanced conclusion\"\n" +
                "}";

        String requestBody = objectMapper.writeValueAsString(new Object() {
            public String model = openaiModel;
            public Object[] messages = new Object[] {
                    new Object() {
                        public String role = "user";
                        public String content = prompt;
                    }
            };
            public int max_tokens = 1000;
            public double temperature = 0.7;
        });

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.openai.com/v1/chat/completions"))
                .header("Authorization", "Bearer " + openaiApiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("OpenAI API error: " + response.body());
        }

        JsonNode json = objectMapper.readTree(response.body());
        return json.get("choices").get(0).get("message").get("content").asText();
    }

    private String callGeminiApi(String topic) throws Exception {
        String prompt = "Generate a debate for this topic in JSON format:\n" +
                "Topic: " + topic + "\n\n" +
                "Return JSON:\n" +
                "{\n" +
                "  \"pro\": \"3-4 sentences supporting this topic\",\n" +
                "  \"against\": \"3-4 sentences opposing this topic\",\n" +
                "  \"summary\": \"2 sentences balanced conclusion\"\n" +
                "}";
        String requestBody = objectMapper.writeValueAsString(new Object() {
            public Object[] contents = new Object[] {
                    new Object() {
                        public Object[] parts = new Object[] {
                                new Object() {
                                    public String text = prompt;
                                }
                        };
                    }
            };
        });

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(
                        "https://generativelanguage.googleapis.com/v1beta/models/"
                                + geminiModel
                                + ":generateContent?key="
                                + geminiApiKey))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("Gemini API error: " + response.body());
        }

        JsonNode json = objectMapper.readTree(response.body());
        return json.get("candidates").get(0).get("content").get("parts").get(0).get("text").asText();
    }

    private DebateContent parseDebateContent(String jsonString) {
        try {
            // First try to extract JSON from the response
            String jsonPart = jsonString;
            int jsonStart = jsonString.indexOf('{');
            int jsonEnd = jsonString.lastIndexOf('}');

            if (jsonStart >= 0 && jsonEnd > jsonStart) {
                jsonPart = jsonString.substring(jsonStart, jsonEnd + 1);
            }

            JsonNode json = objectMapper.readTree(jsonPart);
            return new DebateContent(
                    json.has("pro") ? json.get("pro").asText() : "No pro arguments available",
                    json.has("against") ? json.get("against").asText() : "No against arguments available",
                    json.has("summary") ? json.get("summary").asText() : "Debate generated successfully");
        } catch (Exception e) {
            System.err.println("Error parsing debate content: " + e.getMessage());
            // Return default content if parsing fails
            return new DebateContent(
                    "This topic has interesting supporting arguments that merit consideration.",
                    "However, there are valid counterarguments to consider.",
                    "Both sides of this debate have merit and deserve thoughtful discussion.");
        }
    }

    public DebateResponseDto mapToDto(Debate debate, Long userId) {
        Optional<DebateVote> userVote = userId != null
                ? debateVoteRepository.findByDebateIdAndUserId(debate.getId(), userId)
                : Optional.empty();

        return DebateResponseDto.builder()
                .id(debate.getId())
                .questionId(debate.getQuestion().getId())
                .proText(debate.getProText())
                .againstText(debate.getAgainstText())
                .summary(debate.getSummary())
                .aiProvider(debate.getAiProvider())
                .createdAt(debate.getCreatedAt())
                .proVotes(debate.getProVoteCount())
                .againstVotes(debate.getAgainstVoteCount())
                .totalVotes(debate.getTotalVotes())
                .proPercentage(debate.getProPercentage())
                .againstPercentage(debate.getAgainstPercentage())
                .userVote(userVote.map(DebateVote::getVote).orElse(null))
                .build();
    }

    private static class DebateContent {
        String pro;
        String against;
        String summary;

        DebateContent(String pro, String against, String summary) {
            this.pro = pro;
            this.against = against;
            this.summary = summary;
        }
    }

    private static class AiDebateResult {
        String content;
        String provider;

        AiDebateResult(String content, String provider) {
            this.content = content;
            this.provider = provider;
        }
    }
}
