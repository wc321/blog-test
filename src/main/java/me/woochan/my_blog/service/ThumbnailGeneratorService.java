package me.woochan.my_blog.service;

import me.woochan.my_blog.dto.GeneratorThumbnailRequest;
import me.woochan.my_blog.dto.GeneratorThumbnailResponse;
import me.woochan.my_blog.dto.UploadResponse;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.ai.image.Image;
import org.springframework.ai.image.ImageModel;
import org.springframework.ai.image.ImagePrompt;
import org.springframework.ai.image.ImageResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import java.util.Base64;

@Service
public class ThumbnailGeneratorService {

    private final ImageModel imageModel;
    private final PromptTemplate template;
    private final FileStorageService fileStorageService;
    private final RestClient restClient = RestClient.create();

    public ThumbnailGeneratorService(ImageModel imageModel,
                                     FileStorageService fileStorageService,
                                     @Value("classpath:prompts/thumbnail-generator.st") Resource promptResource) {
        this.imageModel = imageModel;
        this.fileStorageService = fileStorageService;
        this.template = new PromptTemplate(promptResource);
    }

    public GeneratorThumbnailResponse generateThumbnail(GeneratorThumbnailRequest request) {

        String prompt = template.create(request.toMap()).getContents();

        ImageResponse response = imageModel.call(new ImagePrompt(prompt));
        Image image = response.getResult().getOutput();

        String b64 = image.getB64Json();

        if (b64 == null) {
            throw new IllegalStateException("이미지 데이터가 없습니다.");
        }

        byte[] bytes = Base64.getDecoder().decode(b64);

        UploadResponse saved = fileStorageService.store(bytes, "thumbnail.png");

        return new GeneratorThumbnailResponse(saved.imageUrl());
    }
}
