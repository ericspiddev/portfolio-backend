class FeatureBackendInfo { // wrapper class that houses our PR info
    constructor(project, repo, pullRequestId) {
        this.project = project;
        this.repo = repo;
        this.pullRequestId = pullRequestId;
    }
}

export const vuart_feature = [
    new FeatureBackendInfo("seL4", "camkes-vm", 134),
    new FeatureBackendInfo("seL4", "seL4_projects_libs", 133),
];

export const vga_feature = [
    new FeatureBackendInfo("seL4", "seL4", 1288),
    new FeatureBackendInfo("seL4", "util_libs", 186),
];
