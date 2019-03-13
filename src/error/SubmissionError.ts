interface ISubmissionErrorArgument {
    _error: string;
}

export default class SubmissionError extends Error {
    private errors: ISubmissionErrorArgument;

    constructor(errors: ISubmissionErrorArgument) {
        super(errors._error || 'SubmissionError');
        this.errors = errors;
    }
}
